"use client";
import { useEffect, useState } from "react";
import { Select, MenuItem } from "@mui/material";

export default function UserEditor({
  onRoleChange,
  selectedRole,
}: {
  onRoleChange: Function;
  selectedRole: string;
}) {
  const [role, setRole] = useState<string>(selectedRole || "");

  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, [selectedRole]);

  return (
    <div className="bg-slate-100 rounded-lg space-x-5 space-y-2 w-fit px-10 py-5 justify-center">
      <div>
        <p>Change Role</p>
        <Select
          variant="standard"
          name="role"
          id="role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            onRoleChange(e.target.value);
          }}
          className="h-[2em] w-[200px]"
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="banned">Banned</MenuItem>
        </Select>
      </div>
    </div>
  );
}