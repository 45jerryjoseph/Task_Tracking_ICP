import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal} from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Task = Record<{
    creator: Principal;
    id: string;
    title: string;
    description: string;
    created_date: nat64;
    updated_at: Opt<nat64>;
    due_date: string;
    assigned_to: string;
    tags: Vec<string>;
    status: string;
    priority: string; // Added for Task Priority
    comments: Vec<string>; // Added for Task Comments
}>;
type TaskPayload = Record<{
    title: string;
    description: string;
    assigned_to: string;
    due_date: string;
}>;

const taskStorage = new StableBTreeMap<string, Task>(0, 44, 512);

// Number of Tasks to load initially
const initialLoadSize = 4;

// Load the Initial batch of Tasks
$query
export function getInitialTasks(): Result<Vec<Task>, string> {
    const initialTasks = taskStorage.values().slice(0, initialLoadSize);
    return Result.Ok(initialTasks);
}

// Load more Tasks as the user scrolls down
$query
export function loadMoreTasks(offset: number, limit: number): Result<Vec<Task>, string> {
    const moreTasks = taskStorage.values().slice(offset, offset + limit);
    return Result.Ok(moreTasks);
}

// Loading a Specific note
$query
export function getTask(id: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to access Task');
            }
            return Result.Ok<Task, string>(task);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// Get Task available by Tags
$query
export function getTaskByTags(tag: string): Result<Vec<Task>, string> {
    const relatedTask = taskStorage.values().filter((task) => task.tags.includes(tag));
    return Result.Ok(relatedTask);
}

// Search Task
$query
export function searchTasks(searchInput: string): Result<Vec<Task>, string> {
    const lowerCaseSearchInput = searchInput.toLowerCase();
    try {
        const searchedTask = taskStorage.values().filter(
            (task) =>
                task.title.toLowerCase().includes(lowerCaseSearchInput) ||
                task.description.toLowerCase().includes(lowerCaseSearchInput)
        );
        return Result.Ok(searchedTask);
    } catch (err) {
        return Result.Err('Error finding the task');
    }
}

// Allows Assigned user to approve having completed task
$update
export function completedTask(id: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            if (!task.assigned_to) {
                return Result.Err<Task, string>('No one was assigned the task');
            }
            const completeTask: Task = { ...task, status: 'Completed' };
            taskStorage.insert(task.id, completeTask);
            return Result.Ok<Task, string>(completeTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// Allows a group/Organisation to add a Task
$update
export function addTask(payload: TaskPayload): Result<Task, string> {
    // Validate input data
    if (!payload.title || !payload.description || !payload.assigned_to || !payload.due_date) {
        return Result.Err<Task, string>('Missing or invalid input data');
    }

    try {
        const newTask: Task = {
            creator: ic.caller(),
            id: uuidv4(),
            created_date: ic.time(),
            updated_at: Opt.None,
            tags: [],
            status: 'In Progress',
            priority: "",
            comments: [],
            ...payload
        };
        taskStorage.insert(newTask.id, newTask);
        return Result.Ok<Task, string>(newTask);
    } catch (err) {
        return Result.Err<Task, string>('Issue encountered when Creating Task');
    }
}

// Adding Tags to the Task created
$update
export function addTags(id: string, tags: Vec<string>): Result<Task, string> {
    // Validate input data
    if (!tags || tags.length === 0) {
        return Result.Err<Task, string>('Invalid tags');
    }

    return match(taskStorage.get(id), {
        Some: (task) => {
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to access Task');
            }
            const updatedTask: Task = { ...task, tags: [...task.tags, ...tags], updated_at: Opt.Some(ic.time()) };
            taskStorage.insert(task.id, updatedTask);
            return Result.Ok<Task, string>(updatedTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// Giving capability for the creator to be able to Modify task
$update
export function updateTask(id: string, payload: TaskPayload): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            // Authorization Check
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to access Task');
            }
            const updatedTask: Task = { ...task, ...payload, updated_at: Opt.Some(ic.time()) };
            taskStorage.insert(task.id, updatedTask);
            return Result.Ok<Task, string>(updatedTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// Creator can Delete a task
$update
export function deleteTask(id: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            // Authorization Check
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to access Task');
            }
            taskStorage.remove(id);
            return Result.Ok<Task, string>(task);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found, could not be deleted`),
    });
}

// Assign a Task to a User
$update
export function assignTask(id: string, assignedTo: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to assign a task');
            }
            const updatedTask: Task = { ...task, assigned_to: assignedTo };
            taskStorage.insert(task.id, updatedTask);
            return Result.Ok<Task, string>(updatedTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

//Change Task Status
$update
export function changeTaskStatus(id: string, newStatus: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to change the task status');
            }
            const updatedTask: Task = { ...task, status: newStatus };
            taskStorage.insert(task.id, updatedTask);
            return Result.Ok<Task, string>(updatedTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// Get Tasks by Status
$query
export function getTasksByStatus(status: string): Result<Vec<Task>, string> {
    const tasksByStatus = taskStorage.values().filter((task) => task.status === status);
    return Result.Ok(tasksByStatus);
}

// Set Task Priority
$update
export function setTaskPriority(id: string, priority: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            if (task.creator.toString() !== ic.caller().toString()) {
                return Result.Err<Task, string>('You are not authorized to set task priority');
            }
            const updatedTask: Task = { ...task, priority };
            taskStorage.insert(task.id, updatedTask);
            return Result.Ok<Task, string>(updatedTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// Task Due Date Reminder
$update
export function sendDueDateReminder(id: string): Result<string, string> {
    const now = new Date().toISOString();
    return match(taskStorage.get(id), {
        Some: (task) => {
            if (task.due_date < now && task.status !== 'Completed') {
                return Result.Ok<string, string>('Task is overdue. Please complete it.');
            } else {
                return Result.Err<string, string>('Task is not overdue or already completed.');
            }
        },
        None: () => Result.Err<string, string>(`Task with id:${id} not found`),
    });
}

//Get Tasks by Creator
$query
export function getTasksByCreator(creator: Principal): Result<Vec<Task>, string> {
    const creatorTasks = taskStorage.values().filter((task) => task.creator.toString() === creator.toString());
    return Result.Ok(creatorTasks);
}

//Get Overdue Tasks
$query
export function getOverdueTasks(): Result<Vec<Task>, string> {
    const now = new Date().toISOString();
    const overdueTasks = taskStorage.values().filter(
        (task) => task.due_date < now && task.status !== 'Completed'
    );
    return Result.Ok(overdueTasks);
}

// Task Comments
$update
export function addTaskComment(id: string, comment: string): Result<Task, string> {
    return match(taskStorage.get(id), {
        Some: (task) => {
            const updatedComments = [...task.comments, comment];
            const updatedTask: Task = { ...task, comments: updatedComments };
            taskStorage.insert(task.id, updatedTask);
            return Result.Ok<Task, string>(updatedTask);
        },
        None: () => Result.Err<Task, string>(`Task with id:${id} not found`),
    });
}

// UUID workaround
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};
