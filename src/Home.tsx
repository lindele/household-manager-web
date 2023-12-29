import React from "react";
import { useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Delete } from "lucide-react";
import {
  Button,
  Checkbox,
  Label,
  Select,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";

import NavigationBar from "../components/navbar";

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
  const [taskToggleBool, setTaskToggle] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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
            assigned_owner_id: data.task_owner,
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
  const toggleLabel = () => {
    if (taskToggleBool === undefined) {
      ("Error");
    }

    return taskToggleBool ? "All Tasks" : "Your Tasks";
  };

  const displayTaskByOwnerSwitch = () => {
    return (
      <div id="toggleSwitch" className="flex max-w-md flex-col gap-4">
        <ToggleSwitch
          label={toggleLabel()}
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
      <div key={task.id} className="flex">
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
      // const tasks = await response.json();
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
  useEffect(() => {
    const fetchData = async () => {
      await fetchTasks();

      if (user != undefined && user.sub != undefined) {
        newUser(user.sub);
      }
    };

    fetchData();
  }, [user, isPending]);

  // useEffect(() => {
  //   fetchTasks();
  // }, []);

  // if (isPending) {
  //   return <h1>loading...</h1>;
  // }

  // useEffect(() => {
  //   if (user != undefined && user.sub != undefined) {
  //     newUser(user.sub);
  //   }
  // }, [user]);

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

  const userExists = async (user_id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const user = await response.json();
      console.log(user.detail);
      if (user.detail == "Not Found") {
        console.log("WASN'T FOUND");
        return false;
      } else {
        return true;
      }

      // setTasks(tasks);
      // queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      console.error("Error", error);
    }
  };
  const newUser = async (user_id: string) => {
    try {
      const userExistsResult = await userExists(user_id);

      if (!userExistsResult) {
        console.log(
          "CREWATE A NEW USER WITH now: ",
          user_id,
          user?.given_name,
          user?.family_name
        );
        await fetch("http://127.0.0.1:8000/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user?.email,
            username: user?.email,
            first_name: user?.given_name || "DNE",
            last_name: user?.family_name || "DNE",
          }),
        }).catch((error) => {
          console.log("DID NOT CREATE");
          console.error(error);
        });
        // const new_user = await response.json();

        console.log("new user created");
      } else {
        console.log("User already exists");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await addTaskToDatabase(data);
      reset();
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  return (
    <div>
      <NavigationBar />

      <div className="flex items-center justify-center min-h-screen">
        {isLoading && <div>Loading ...</div>}

        {isAuthenticated && (
          <div>
            <div>{displayTaskByOwnerSwitch()}</div>
            <div> {displaySortedTasks()}</div>
            <form
              className="flex max-w-md flex-col gap-4 "
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
                  <Label
                    htmlFor="daysOfTheWeek"
                    value="Select day of the Week"
                  />
                </div>
                <Select
                  id="daysOfTheWeek"
                  {...register("task_due_day")}
                  required
                >
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
      </div>
    </div>
  );
}
