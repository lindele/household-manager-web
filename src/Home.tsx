import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useForm } from "react-hook-form";

const addTaskToDatabase = async (
  title: string,
  due_day: string,
  assigned_owner_id: string
) => {
  if (title !== "") {
    // add it to db here
    try {
      await fetch("http://127.0.0.1:8000/tasks/add-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          due_day: due_day,
          assigned_owner_id: assigned_owner_id,
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

  return (
    <>
      <h1>Home</h1>
      {isLoading && <div>Loading ...</div>}
      {isAuthenticated && (
        <div>
          <form
            onSubmit={(e) => {
              // e.preventDefault();
              console.log(e);
              handleSubmit(addTaskToDatabase("village", "monday", "4"));
            }}
            // action={addTaskToDatabase(FormData.get("task"), "Monday", "4")}
          >
            <label htmlFor="Task Title">User Name</label>
            <input placeholder="Bill" />

            <input type="submit" />
            {/* <input name="task" />
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log(e);
                addTaskToDatabase("georgeShrinks", "e", "t");
              }}
              className="btn"
            >
              Add to Database
            </button> */}
          </form>
          {/* <h3>test</h3>
          <img src={user?.picture} alt={user?.name} />
          <h2>{user?.name}</h2>
          <p>{user?.email}</p> */}
        </div>
      )}
    </>
  );
}
