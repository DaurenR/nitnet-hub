import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api, getRole } from "../../lib/api";

interface MioForm {
  repOfficeName?: string;
  clientName: string;
  endUser?: string;
  physicalAddress: string;
  serviceName: string;
  bandwidthKbps: number;
  tariffPlan?: string;
  provider: string;
  connectionType?: string;
  providerId?: string;
  ipAddress?: string;
  p2pIp?: string;
  manager?: string;
}

export default function MioCreate() {
  const router = useRouter();
  const role = getRole();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MioForm>();

  const ipRegex = /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/;

  useEffect(() => {
    if (role === "support") {
      router.replace({ pathname: "/mio", query: router.query });
    }
  }, [role, router]);

  const onSubmit = async (values: MioForm) => {
    const res = await api(`/mio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
          <label className="block mb-1">Rep Office Name</label>
          <input
            className="border p-2 w-full"
            {...register("repOfficeName")}
          />
        </div>
        <div>
          <label className="block mb-1">Client Name</label>
          <input
            className="border p-2 w-full"
            {...register("clientName", { required: true })}
          />
          {errors.clientName && (
            <p className="text-red-500 text-sm">Client Name is required</p>
          )}
        </div>
         <div>
          <label className="block mb-1">End User</label>
          <input className="border p-2 w-full" {...register("endUser")} />
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
          <label className="block mb-1">Provider ID</label>
          <input className="border p-2 w-full" {...register("providerId")} />
        </div>
        <div>
          <label className="block mb-1">Bandwidth (Kbps)</label>
          <input
            type="number"
            min={1}
            className="border p-2 w-full"
            {...register("bandwidthKbps", {
              required: true,
              valueAsNumber: true,
              min: 1,
            })}
          />
          {errors.bandwidthKbps && (
            <p className="text-red-500 text-sm">Bandwidth must be at least 1</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Connection Type</label>
          <input className="border p-2 w-full" {...register("connectionType")} />
        </div>
        <div>
          <label className="block mb-1">IP Address</label>
          <input
            className="border p-2 w-full"
            {...register("ipAddress", { validate: (v) => !v || ipRegex.test(v) })}
          />
          {errors.ipAddress && (
            <p className="text-red-500 text-sm">Invalid IP Address</p>
          )}
        </div>
        <div>
          <label className="block mb-1">P2P IP</label>
          <input
            className="border p-2 w-full"
            {...register("p2pIp", { validate: (v) => !v || ipRegex.test(v) })}
          />
          {errors.p2pIp && (
            <p className="text-red-500 text-sm">Invalid P2P IP</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Manager</label>
          <input className="border p-2 w-full" {...register("manager")} />
        </div>
        <div>
          <label className="block mb-1">Physical Address</label>
          <input
            className="border p-2 w-full"
            {...register("physicalAddress", { required: true })}
          />
          {errors.physicalAddress && (
            <p className="text-red-500 text-sm">Physical Address is required</p>
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