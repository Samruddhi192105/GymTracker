require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing supabase env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey || supabaseAnonKey);

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'no token' });
  }

  const token = header.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'invalid token' });
    }
    req.user = user;
    req.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    next();
  } catch (e) {
    return res.status(401).json({ error: 'auth failed' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/dashboard', auth, async (req, res) => {
  const sb = req.supabase;
  const uid = req.user.id;

  const { count: totalWorkouts } = await sb
    .from('workouts')
    .select('*', { count: 'exact', head: true });

  const { data: sets } = await sb
    .from('workout_sets')
    .select('exercise_id, weight, reps, workouts!inner(user_id)')
    .eq('workouts.user_id', uid);

  let totalVolume = 0;
  const uniqueExercises = new Set();

  if (sets) {
    for (const s of sets) {
      totalVolume += Number(s.weight) * Number(s.reps);
      uniqueExercises.add(s.exercise_id);
    }
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: thisWeek } = await sb
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .gte('workout_date', startOfWeek.toISOString().split('T')[0]);

  const { data: dates } = await sb
    .from('workouts')
    .select('workout_date')
    .order('workout_date', { ascending: false });

  const uniqueDates = [...new Set((dates || []).map(d => d.workout_date))].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;

  if (uniqueDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latest = new Date(uniqueDates[0]);
    latest.setHours(0, 0, 0, 0);

    const stillActive = latest.getTime() === today.getTime() || latest.getTime() === yesterday.getTime();

    if (stillActive) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        prev.setHours(0, 0, 0, 0);
        curr.setHours(0, 0, 0, 0);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    let temp = 1;
    longestStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        temp++;
        if (temp > longestStreak) longestStreak = temp;
      } else {
        temp = 1;
      }
    }
  }

  res.json({
    totalWorkouts: totalWorkouts || 0,
    totalExercisesPerformed: uniqueExercises.size,
    totalVolume: Math.round(totalVolume),
    workoutsThisWeek: thisWeek || 0,
    currentStreak,
    longestStreak
  });
});

app.get('/api/progress/:exerciseId', auth, async (req, res) => {
  const { exerciseId } = req.params;
  const sb = req.supabase;

  const { data: sets, error } = await sb
    .from('workout_sets')
    .select(`
      id, weight, reps, set_number, workout_id,
      workouts!inner (id, workout_date, name, user_id)
    `)
    .eq('exercise_id', exerciseId)
    .order('workouts(workout_date)', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!sets || sets.length === 0) {
    return res.json({
      previous: null,
      current: null,
      bestWeight: 0,
      bestReps: 0,
      estimated1RM: 0,
      indicator: null
    });
  }

  const byWorkout = {};
  for (const s of sets) {
    if (!byWorkout[s.workout_id]) {
      byWorkout[s.workout_id] = {
        date: s.workouts.workout_date,
        name: s.workouts.name,
        sets: []
      };
    }
    byWorkout[s.workout_id].sets.push({
      weight: Number(s.weight),
      reps: Number(s.reps)
    });
  }

  const workouts = Object.values(byWorkout).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const current = workouts[0] || null;
  const previous = workouts[1] || null;

  let bestWeight = 0;
  let bestReps = 0;
  let max1rm = 0;

  for (const s of sets) {
    const w = Number(s.weight);
    const r = Number(s.reps);
    if (w > bestWeight) bestWeight = w;
    if (r > bestReps) bestReps = r;
    const oneRM = w * (1 + r / 30);
    if (oneRM > max1rm) max1rm = oneRM;
  }

  let indicator = null;
  if (current && previous) {
    const currBest = Math.max(...current.sets.map(s => s.weight * (1 + s.reps / 30)));
    const prevBest = Math.max(...previous.sets.map(s => s.weight * (1 + s.reps / 30)));
    if (currBest > prevBest) indicator = 'improved';
    else if (currBest < prevBest) indicator = 'decreased';
    else indicator = 'maintained';
  }

  res.json({
    previous,
    current,
    bestWeight,
    bestReps,
    estimated1RM: Math.round(max1rm * 10) / 10,
    indicator
  });
});

app.get('/api/streak', auth, async (req, res) => {
  const sb = req.supabase;

  const { data: dates } = await sb
    .from('workouts')
    .select('workout_date')
    .order('workout_date', { ascending: false });

  const uniqueDates = [...new Set((dates || []).map(d => d.workout_date))].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;

  if (uniqueDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latest = new Date(uniqueDates[0]);
    latest.setHours(0, 0, 0, 0);

    const stillActive = latest.getTime() === today.getTime() || latest.getTime() === yesterday.getTime();

    if (stillActive) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        prev.setHours(0, 0, 0, 0);
        curr.setHours(0, 0, 0, 0);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    let temp = 1;
    longestStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        temp++;
        if (temp > longestStreak) longestStreak = temp;
      } else {
        temp = 1;
      }
    }
  }

  res.json({
    currentStreak,
    longestStreak,
    workoutDays: uniqueDates.length
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'something went wrong' });
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
