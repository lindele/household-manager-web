import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useForm } from "react-hook-form";
import { TextInput, Label, Button, Checkbox, Select } from "flowbite-react";

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

  // const addDaysToDropdown = () => {
  //   return (

  //   );
  // };

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
              <option>Ethan</option>
              <option>Dane</option>
              <option>Tanner</option>
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
        // <div>
        //   <form onSubmit={handleSubmit(onSubmit)}>
        //     <input {...register("task")} placeholder="Task Name" />
        //     <input {...register("day")} placeholder="Day of the Week" />
        //     <div className="dropdown">
        //       <div tabIndex={0} role="button" className="btn m-1">
        //         Select Day of the Week
        //       </div>
        //       {addDaysToDropdown()}
        //     </div>
        //     <input type="submit" />
        //   </form>
        // </div>
      )}
    </>
  );
}
