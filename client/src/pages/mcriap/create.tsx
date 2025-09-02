import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api, getRole } from "../../lib/api";

interface McriapForm {
  network: string;
  agencyName: string;
  serviceName: string;
  provider: string;
  region: string;
  bandwidthKbps: number;
  tariffPlan?: string;
  connectionType?: string;
  ipAddress: string;
  p2pIp: string;
  externalId: string;
  manager: string;
  physicalAddress: string;
}

export default function McriapCreate() {
  const router = useRouter();
  const role = getRole();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<McriapForm>();

  const ipRegex = /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/;

  useEffect(() => {
    if (role === "support") {
      router.replace({ pathname: "/mcriap", query: router.query });
    }
  }, [role, router]);

  const onSubmit = async (values: McriapForm) => {
    const res = await api(`/mcriap`, {
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
      toast.success("Saved");
      const { page, perPage, sort, order, q } = router.query;
      router.push({
        pathname: "/mcriap",
        query: { page, perPage, sort, order, q },
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6 font-bold">Create MCRIAP Channel</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Network</label>
          <input
            className="border p-2 w-full"
            {...register("network", { required: true })}
          />
          {errors.network && (
            <p className="text-red-500 text-sm">Network is required</p>
          )}
        </div>
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
          <label className="block mb-1">Region</label>
          <input className="border p-2 w-full" {...register("region")} />
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
            <p className="text-red-500 text-sm">
              Bandwidth must be at least 1
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1">Tariff Plan</label>
          <input className="border p-2 w-full" {...register("tariffPlan")} />
        </div>
        <div>
          <label className="block mb-1">Connection Type</label>
          <input
            className="border p-2 w-full"
            {...register("connectionType")}
          />
        </div>
        <div>
          <label className="block mb-1">IP Address</label>
          <input
            className="border p-2 w-full"
            {...register("ipAddress", {
              validate: (v) => !v || ipRegex.test(v),
            })}
          />
          {errors.ipAddress && (
            <p className="text-red-500 text-sm">Invalid IP Address</p>
          )}
        </div>
        <div>
          <label className="block mb-1">P2P IP</label>
          <input
            className="border p-2 w-full"
             {...register("p2pIp", {
              validate: (v) => !v || ipRegex.test(v),
            })}
          />
          {errors.p2pIp && (
            <p className="text-red-500 text-sm">Invalid P2P IP</p>
          )}
        </div>
        <div>
          <label className="block mb-1">External ID</label>
          <input className="border p-2 w-full" {...register("externalId")} />
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
            <p className="text-red-500 text-sm">
              Physical Address is required
            </p>
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
