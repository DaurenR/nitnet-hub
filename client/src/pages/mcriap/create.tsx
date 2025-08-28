import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface McriapForm {
  agencyName: string;
  provider: string;
  bandwidthKbps: number;
  region: string;
  ipAddress: string;
}

export default function McriapCreate() {
  const router = useRouter();
  const role = process.env.NEXT_PUBLIC_ROLE;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<McriapForm>();

  useEffect(() => {
    if (role === "support") {
      router.replace({ pathname: "/mcriap", query: router.query });
    }
  }, [role, router]);

  const onSubmit = async (values: McriapForm) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mcriap`, {
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
      router.push({ pathname: "/mcriap", query: router.query });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">Create MCRIAP Channel</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Agency Name</label>
          <input
            className="border p-2 w-full"
            {...register("agencyName", { required: true })}
          />
          {errors.agencyName && (
            <p className="text-red-500 text-sm">Agency Name is required</p>
          )}
        </div>
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
          <label className="block mb-1">Bandwidth (Kbps)</label>
          <input
            type="number"
            className="border p-2 w-full"
            {...register("bandwidthKbps", { required: true, valueAsNumber: true })}
          />
          {errors.bandwidthKbps && (
            <p className="text-red-500 text-sm">Bandwidth is required</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Region</label>
          <input
            className="border p-2 w-full"
            {...register("region", { required: true })}
          />
          {errors.region && (
            <p className="text-red-500 text-sm">Region is required</p>
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