import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useRef } from "react";

import { useForm } from "react-hook-form";
import {
  TextInput,
  Label,
  Button,
  Checkbox,
  Select,
  ToggleSwitch,
} from "flowbite-react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Delete, PlusSquare } from "lucide-react";
import React from "react";

enum dow {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thurday = 4,
  Friday = 5,
  Saturday = 6,
}

let database = {
  householdName: "James St House",
  userName: 2,
  household: ["1", "2", "3", "4"],
  numberOfStrikes: 3,
  penalty: "owe the household beer. ",
  moneyYouOwe: -4,
};

export function Home() {
  // const isLoadingComplete = useCachedResources();

  const [taskToggleBool, setTaskToggle] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
  } = useForm();

  const queryClient = useQueryClient();
  useQuery({ queryKey: ["tasks"], queryFn: () => fetchTasks() });

  const toggleBooleanValue = (
    value: boolean | ((prevState: boolean) => boolean)
  ) => {
    setTaskToggle(value);
  };

  const addTaskToDatabase = async (data) => {
    if (data.task !== "") {
      // add it to db here
      try {
        await fetch("http://127.0.0.1:8000/tasks/add-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.task,
            due_day: data.task_due_day,
            assigned_owner_id: 4,
          }),
        }).catch((error) => {
          console.error(error);
        });

        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } catch (error) {
        // Handle fetch or other errors
        console.error("Error:", error);
        // show a toast or other UI indication of the error?
      }
    }
  };

  // from here...
  const displayTaskByOwnerSwitch = () => {
    return (
      <div id="toggleSwitch" className="flex max-w-md flex-col gap-4">
        {(!taskToggleBool && <Label>Your Tasks</Label>) ||
          (taskToggleBool && <Label>All Tasks</Label>)}
        <ToggleSwitch
          checked={taskToggleBool}
          onChange={(taskToggleBool) => {
            toggleBooleanValue(taskToggleBool);
          }}
        />
      </div>
    );
  };

  const displaySortedTasks = () => {
    if (isPending) {
      return <h1>error</h1>;
    }
    if (tasks === undefined || tasks === null) {
      return <h1>tasks error</h1>;
    }

    return (
      <div id="apiResponse">
        {tasks!
          .sort((a, b) => dow[a.due_day] - dow[b.due_day])
          .map(
            (task: {
              id: number;
              title: string;
              complete: boolean;
              owner_id: number;
              due_day: string;
            }) => (
              <React.Fragment key={task.id}>
                {(!taskToggleBool &&
                  database.userName === task.owner_id &&
                  displayOneTaskLine(task)) ||
                  (taskToggleBool && displayOneTaskLine(task))}
              </React.Fragment>
            )
          )}
      </div>
    );
  };

  const displayOneTaskLine = (task: {
    id: number;
    title: string;
    complete: boolean;
    owner_id: number;
    due_day: string;
  }) => {
    return (
      <div key={task.id}>
        {/* <HStack space="md" alignItems="center"> */}
        <Checkbox
          checked={task.complete}
          onChange={() => toggleTaskCompletionStatus(task.id, task.complete)}
          value={task.title}
          aria-label="Checkbox to mark task completed"
        ></Checkbox>
        <Label>
          {task.title} on {task.due_day}
        </Label>

        <Button
          as={Delete}
          size="sm"
          aria-label="Delete this task"
          onClick={() => deleteTaskByID(task.id)}
        ></Button>
      </div>
    );
  };

  const toggleTaskCompletionStatus = async (
    id: number,
    current_status: boolean
  ) => {
    try {
      const changed_status = !current_status;
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/complete-task/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complete: changed_status,
          }),
        }
      );
      const tasks = await response.json();
      // setTasks(tasks);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      console.error("Error", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/tasks/tasks");
      const tasks = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // setTasks(tasks);
      return tasks;
    } catch (error) {
      console.error("error fetching tasks:", error);
    }
  };

  const {
    isPending,
    error,
    data: tasks,
  } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const deleteTaskByID = async (index: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/delete-task/${index}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const tasks = await response.json();
      // setTasks(tasks);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      console.error("Error", error);
    }
  };
  // ...to here

  const onSubmit = async (data) => {
    try {
      await addTaskToDatabase(data);
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (isPending) {
    return <h1>loading...</h1>;
  }

  return (
    <>
      <h1>Home</h1>
      {isLoading && <div>Loading ...</div>}
      {isAuthenticated && (
        <div>
          <div>{displayTaskByOwnerSwitch()}</div>
          <div> {displaySortedTasks()}</div>
          <form
            className="flex max-w-md flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <TextInput
                id="task"
                type="text"
                {...register("task")}
                placeholder="Task Name"
                required
              />
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="task_owner" value="Select Task Owner" />
              </div>
              <Select id="task_owner" {...register("task_owner")} required>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </Select>
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="daysOfTheWeek" value="Select day of the Week" />
              </div>
              <Select id="daysOfTheWeek" {...register("task_due_day")} required>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </Select>
            </div>

            <Button type="submit">Submit</Button>
          </form>
        </div>
      )}
    </>
  );
}
