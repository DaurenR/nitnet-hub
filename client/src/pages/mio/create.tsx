import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface MioForm {
  provider: string;
  serviceName: string;
  ipAddress: string;
}

export default function MioCreate() {
  const router = useRouter();
  const role = process.env.NEXT_PUBLIC_ROLE;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MioForm>();

  useEffect(() => {
    if (role === "support") {
      router.replace({ pathname: "/mio", query: router.query });
    }
  }, [role, router]);

  const onSubmit = async (values: MioForm) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-role": process.env.NEXT_PUBLIC_ROLE,
      },
      body: JSON.stringify(values),
    });
    if (res.status === 403) {
      alert("Forbidden");
      return;
    }
    if (res.ok) {
      alert("Saved");
      router.push({ pathname: "/mio", query: router.query });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">Create MIO Channel</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Provider</label>
          <input
            className="border p-2 w-full"
            {...register("provider", { required: true })}
          />
          {errors.provider && (
            <p className="text-red-500 text-sm">Provider is required</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Service Name</label>
          <input
            className="border p-2 w-full"
            {...register("serviceName", { required: true })}
          />
          {errors.serviceName && (
            <p className="text-red-500 text-sm">Service Name is required</p>
          )}
        </div>
        <div>
          <label className="block mb-1">IP Address</label>
          <input
            className="border p-2 w-full"
            {...register("ipAddress", { required: true })}
          />
          {errors.ipAddress && (
            <p className="text-red-500 text-sm">IP Address is required</p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
}