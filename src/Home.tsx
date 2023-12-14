import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useForm } from "react-hook-form";

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
          due_day: "Monday",
          assigned_owner_id: 4,
        }),
      }).catch((error) => {
        console.error(error);
      });

      // queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      // Handle fetch or other errors
      console.error("Error:", error);
      // show a toast or other UI indication of the error?
    }
  }
};

export function Home() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await addTaskToDatabase(data);
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  return (
    <>
      <h1>Home</h1>
      {isLoading && <div>Loading ...</div>}
      {isAuthenticated && (
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("task")} placeholder="Task Name" />
            <input type="submit" />
          </form>
        </div>
      )}
    </>
  );
}
