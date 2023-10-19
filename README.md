# Azle (DFINITY) Task Management System


The Azle Task Management System is a web-based application that helps users manage tasks and assignments. Built on Azle, it provides an efficient and secure platform for organizations, groups, or individuals to streamline their task management processes. You can always refer to [The Azle Book](https://demergent-labs.github.io/azle/) for more in-depth documentation.

## Features

- **User-friendly Interface:** The system offers an intuitive and easy-to-use interface, making task management a breeze.
- **Real-time Updates:** Get real-time updates on task status, assignment, and due dates, ensuring everyone stays on the same page.
- **Tagging System:** Organize tasks using tags, making it easier to categorize and search for specific tasks.
- **Search Functionality:** Quickly find tasks by searching through titles and descriptions.
- **Task Assignment:** Assign tasks to team members and track their progress.
- **Due Date Management:** Set due dates for tasks and keep an eye on approaching deadlines.
- **Authorization and Security:** The system ensures that users can only access and modify tasks they are authorized to work on, maintaining data security.

## Usage

To use the Azle Task Management System, you need to have an Azle (DFINITY) account. Here's how to get started:

- **Initial Tasks:** To load the initial batch of tasks, use the `getInitialTasks` query function. This function retrieves the first tasks for you to work with.
- **Loading More Tasks:** As you scroll through your task list, you can use the `loadMoreTasks` query function to fetch additional tasks in a paginated manner.
- **Task Details:** To access the details of a specific task, use the `getTask(id)` query function, providing the task's unique ID.
- **Filter by Tags:** You can filter tasks by tags using the `getTaskByTags(tag)` query function. It returns all tasks with the specified tag.
- **Search for Tasks:** The `searchTasks(searchInput)` query function allows you to search for tasks based on keywords found in their titles or descriptions.
- **Task Completion:** When a task is completed, use the `completedTask(id)` update function to mark it as completed.
- **Adding Tasks:** Organizations or groups can add tasks using the `addTask(payload)` update function. Provide the task's details in the payload.
- **Adding Tags:** For task creators, use the `addTags(id, tags)` update function to add tags to a task.
- **Task Modification:** The `updateTask(id, payload)` update function allows task creators to modify task details.
- **Task Deletion:** To delete a task, use the `deleteTask(id)` update function, but note that only the task's creator can delete it.
- **Assign Task:** To assign a task to a user, use the `assignTask(id,assignedTo)` update function, but note that only the task's creator can assign it.
- **Change Task Status:** To change the Task Status, use the `changeTaskStatus(id,newStatus)` update function, but note that only the task's creator can change it.
- **Get Task by Status:** To get Task by Status, use the `getTasksByStatus(status)` query function, but note that only the task's creator can change it.
- **Set Task by Priority:** To set Task by Priority, use the `setTaskPriority(id,priority)` update function, but note that only the task's creator can change it.
- **Send due date Reminder:** To send Due Date Reminder, use the `sendDueDateReminder(status)` update function, but note that only the task's creator can change it.
 **Get Tasks by Creator:** To get Task by Creator, use the `getTasksByCreator(creator)` query function.
 **Get Overdue Tasks:** To get Overdue Tasks, use the `getOverdueTasks()` query function.
- **Add Task Comment:** To send Due Date Reminder, use the `addTaskComment(id, comment)` update function.


## Installation

You can run your Azle Task Management System in your Azle environment or a development environment.

1. **Environment Setup:** Ensure you have an Azle environment set up and running.
2. **Deployment:** Deploy the Task Management System canister to your Azle environment.
3. **Configuration:** Update your system configurations as needed.
4. **Use the System:** Access the system via a web browser and start managing your tasks.


## Run Locally

`dfx` is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

```bash
npm run dfx_install
```

Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

```bash
dfx start --background
```

If you ever want to stop the replica:

```bash
dfx stop
```

Now you can deploy your canister locally:

```bash
npm install
dfx deploy
```

## Contributing

We welcome contributions from the community to enhance the Azle Task Management System. If you want to contribute, please follow these steps:

1. **Fork the repository to your own account.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure all tests pass.
4. Submit a pull request for review.

Thank you for considering contributing to our project. Your contributions help make this system better for everyone.

