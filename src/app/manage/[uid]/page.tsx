"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserEditor from "@/components/UserEditor";
import getUser from "@/libs/getUser";
import updateUser from "@/libs/updateUser";

export default function EditUser({ params }: { params: { uid: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [userJson, setUserJson] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!session || !session.user?.token) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  // Fetch booking data on mount
  useEffect(() => {
    if (session?.user?.token) {
      getUser(session.user.token, params.uid)
        .then((data) => {
          setUserJson(data);
          setRole(data.data.role || "");
          setName(data.data.name || "");
          setEmail(data.data.email || "");
          setTelephone(data.data.email || "");
        })
        .catch(() => setError("Failed to load user data"));
    }
  }, [session, params.uid]);

  const handleEditUser = async () => {
    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (!session?.user?.token) {
      setError("You must be logged in to edit user.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUser(session.user.token, params.uid, role);
      setSuccess("User Edited!");
    } catch (err) {
      setError("Failed to edit user.");
    } finally {
      setLoading(false);
    }
  };

  if (!userJson) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-fade-in">
          <div className="flex justify-center space-x-2 mb-5">
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce"></div>
          </div>
          
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Loading User details<span className="animate-ellipsis">...</span>
          </p>
          
          <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-[#5EBFD3] rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      {/* Header Banner */}
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Edit User</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/manage" className="hover:text-blue-600">
            Manage
          </Link>{" "}
          / <span>Edit User</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            Edit user : <span className="text-[#4AA3BA]">{name}</span>
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg max-w-lg mx-auto p-8">
          <h2 className="p-3 font-bold">
            ID: <span className="font-normal">{params.uid}</span>
          </h2>
          <h2 className="p-3 font-bold">
            Name: <span className="font-normal">{name}</span>
          </h2>
          <h2 className="p-3 font-bold">
            Email: <span className="font-normal">{email}</span>
          </h2>
          <h2 className="p-3 font-bold">
            Telephone: <span className="font-normal">{telephone}</span>
          </h2>
          <UserEditor
            onRoleChange={(value: string) => setRole(value)}
            selectedRole={role}
          />

          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-500 mt-4">{success}</p>}

          <div className="mt-8">
            <button
              className="w-full bg-[#5EBFD3] hover:bg-[#4AA3BA] text-white font-medium py-3 px-4 rounded-full transition-colors duration-200"
              onClick={handleEditUser}
              disabled={loading}
            >
              {loading ? "Editing User..." : "Edit User"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}