import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { format } from 'date-fns'

export default function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [workout, setWorkout] = useState(null)
  const [sets, setSets] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [pendingExercises, setPendingExercises] = useState([])
  const [pendingSetDrafts, setPendingSetDrafts] = useState({})
  const [newSet, setNewSet] = useState({ weight: '', reps: '' })
  const [editingSet, setEditingSet] = useState(null)
  const [editForm, setEditForm] = useState({ weight: '', reps: '' })

  const fetchData = async () => {
    // Workout
    const { data: w, error: wErr } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single()
    if (wErr || !w) {
      navigate('/workouts')
      return
    }
    setWorkout(w)

    // Sets with exercise info
    const { data: s } = await supabase
      .from('workout_sets')
      .select(`
        *,
        exercises (id, name, muscle_group, equipment)
      `)
      .eq('workout_id', id)
      .order('created_at')
    setSets(s || [])

    // All user exercises for adding
    const { data: ex } = await supabase
      .from('exercises')
      .select('*')
      .order('name')
    setExercises(ex || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // Group sets by exercise
  const grouped = {}
  sets.forEach((s) => {
    const eid = s.exercise_id
    if (!grouped[eid]) {
      grouped[eid] = {
        exercise: s.exercises,
        sets: []
      }
    }
    grouped[eid].sets.push(s)
  })

  const handleAddSet = async (exerciseId, type = 'existing') => {
    const draft = type === 'pending' ? pendingSetDrafts[exerciseId] : newSet
    if (!draft || !draft.weight || !draft.reps) return

    const existingSets = grouped[exerciseId]?.sets || []
    const setNumber = existingSets.length + 1

    const { error } = await supabase.from('workout_sets').insert({
      workout_id: id,
      exercise_id: exerciseId,
      set_number: setNumber,
      weight: parseFloat(draft.weight),
      reps: parseInt(draft.reps)
    })
    if (error) alert(error.message)
    else {
      if (type === 'pending') {
        setPendingExercises((prev) => prev.filter((item) => item.id !== exerciseId))
        setPendingSetDrafts((prev) => {
          const next = { ...prev }
          delete next[exerciseId]
          return next
        })
      } else {
        setNewSet({ weight: '', reps: '' })
      }
      fetchData()
    }
  }

  const handleAddExerciseToWorkout = () => {
    if (!selectedExercise) return

    const exercise = exercises.find((item) => item.id === selectedExercise)
    if (!exercise) return

    setPendingExercises((prev) => {
      if (prev.some((item) => item.id === exercise.id)) return prev
      return [...prev, exercise]
    })

    setPendingSetDrafts((prev) => ({
      ...prev,
      [exercise.id]: { weight: '', reps: '' }
    }))

    setShowAddExercise(false)
    setSelectedExercise('')
  }

  const handleDeleteSet = async (setId) => {
    if (!confirm('Delete this set?')) return
    const { error } = await supabase.from('workout_sets').delete().eq('id', setId)
    if (error) alert(error.message)
    else fetchData()
  }

  const startEditSet = (s) => {
    setEditingSet(s.id)
    setEditForm({ weight: s.weight, reps: s.reps })
  }

  const saveEditSet = async (setId) => {
    const { error } = await supabase
      .from('workout_sets')
      .update({
        weight: parseFloat(editForm.weight),
        reps: parseInt(editForm.reps)
      })
      .eq('id', setId)
    if (error) alert(error.message)
    else {
      setEditingSet(null)
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/workouts"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workouts
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
        <p className="text-gray-500 mt-1">
          {format(new Date(workout.workout_date), 'dd MMMM yyyy')}
        </p>
      </div>

      {/* Exercises in this workout */}
      <div className="space-y-6">
        {pendingExercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-xl border border-dashed border-primary-200 overflow-hidden">
            <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                <p className="text-xs text-gray-500">
                  {exercise.muscle_group} • {exercise.equipment}
                </p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">Start the first set for this exercise.</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Weight"
                  value={pendingSetDrafts[exercise.id]?.weight || ''}
                  onChange={(e) => setPendingSetDrafts((prev) => ({
                    ...prev,
                    [exercise.id]: {
                      ...((prev[exercise.id] || { weight: '', reps: '' })),
                      weight: e.target.value
                    }
                  }))}
                  className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-400 text-sm">×</span>
                <input
                  type="number"
                  placeholder="Reps"
                  value={pendingSetDrafts[exercise.id]?.reps || ''}
                  onChange={(e) => setPendingSetDrafts((prev) => ({
                    ...prev,
                    [exercise.id]: {
                      ...((prev[exercise.id] || { weight: '', reps: '' })),
                      reps: e.target.value
                    }
                  }))}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => handleAddSet(exercise.id, 'pending')}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                >
                  Save First Set
                </button>
              </div>
            </div>
          </div>
        ))}

        {Object.values(grouped).map(({ exercise, sets: exerciseSets }) => (
          <div key={exercise.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                <p className="text-xs text-gray-500">
                  {exercise.muscle_group} • {exercise.equipment}
                </p>
              </div>
            </div>

            <div className="p-4">
              {/* Sets table */}
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="pb-2 font-medium w-16">Set</th>
                    <th className="pb-2 font-medium">Weight (kg)</th>
                    <th className="pb-2 font-medium">Reps</th>
                    <th className="pb-2 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseSets
                    .filter(s => !(s.weight === 0 && s.reps === 0))
                    .map((s, idx) => (
                    <tr key={s.id} className="border-t border-gray-50">
                      {editingSet === s.id ? (
                        <>
                          <td className="py-2 text-gray-500">{idx + 1}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              step="0.5"
                              value={editForm.weight}
                              onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                              className="w-24 px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={editForm.reps}
                              onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                              className="w-20 px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              <button onClick={() => saveEditSet(s.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingSet(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 text-gray-500">{idx + 1}</td>
                          <td className="py-2 font-medium">{s.weight} kg</td>
                          <td className="py-2 font-medium">{s.reps}</td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              <button onClick={() => startEditSet(s)} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteSet(s.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add set form */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Weight"
                  value={newSet.weight}
                  onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-400 text-sm">×</span>
                <input
                  type="number"
                  placeholder="Reps"
                  value={newSet.reps}
                  onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                >
                  Add Set
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={() => setShowAddExercise(true)}
        className="mt-6 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Exercise to Workout
      </button>

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Exercise</h2>
              <button onClick={() => setShowAddExercise(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {exercises.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No exercises in your library.{' '}
                  <Link to="/exercises" className="text-primary-600 hover:underline">
                    Create some first
                  </Link>
                </p>
              ) : (
                <>
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select an exercise...</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.muscle_group})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddExerciseToWorkout}
                    disabled={!selectedExercise}
                    className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    Add to Workout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
