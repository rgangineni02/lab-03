import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks.map(t => ({...t, item: t.item})));
  }, [tasks]);

  const saveTasks = async taskList => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(taskList));
    } catch (error) {
      console.error('Failed to save the tasks.');
    }
  };

  const loadTasks = async () => {
    try {
      const loadedTasks = await AsyncStorage.getItem('tasks');
      if (loadedTasks !== null) {
        const loadedTasksArray = JSON.parse(loadedTasks);
        setTasks(
          loadedTasksArray.map(t => ({...t, opacity: new Animated.Value(1)})),
        );
      }
    } catch (error) {
      console.error('Failed to load the tasks.');
    }
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        opacity: new Animated.Value(0), // Initial opacity for animation
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      Animated.timing(newTask.opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setTask('');
    }
  };

  const deleteTask = taskId => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    Animated.timing(tasks[taskIndex].opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setTasks(tasks.filter(item => item.id !== taskId)));
  };

  const toggleTaskCompletion = taskId => {
    setTasks(
      tasks.map(t => (t.id === taskId ? {...t, completed: !t.completed} : t)),
    );
  };

  const startEdit = taskId => {
    const taskToEdit = tasks.find(t => t.id === taskId);
    setEditTaskId(taskId);
    setEditText(taskToEdit.text);
  };

  const handleEdit = text => {
    setEditText(text);
  };

  const saveEdit = taskId => {
    setTasks(tasks.map(t => (t.id === taskId ? {...t, text: editText} : t)));
    setEditTaskId(null);
    setEditText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={text => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({item}) => (
          <Animated.View
            style={[styles.taskContainer, {opacity: item.opacity}]}>
            {editTaskId === item.id ? (
              <TextInput
                style={styles.input}
                onChangeText={handleEdit}
                value={editText}
                autoFocus={true}
                onBlur={() => saveEdit(item.id)}
              />
            ) : (
              <TouchableOpacity onPress={() => startEdit(item.id)}>
                <Text
                  style={
                    item.completed ? styles.taskTextCompleted : styles.taskText
                  }>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Text style={styles.toggleButton}>
                  {item.completed ? 'Undo' : 'Done'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>X</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  taskTextCompleted: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  toggleButton: {
    marginRight: 10,
    color: '#5C5CFF',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
