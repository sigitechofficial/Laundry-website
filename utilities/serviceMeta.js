import { MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";

export function getServiceMeta(name = "") {
  const n = name.toLowerCase().replace(/\s+/g, " ");

  if (n.includes("dry clean") || n.includes("dryclean")) {
    return {
      Icon: MdOutlineDryCleaning,
      iconBg: "bg-card-green",
      iconColor: "text-theme-gray-3",
      description: "For delicate items and fabrics.",
    };
  }

  if (
    (n.includes("wash") && n.includes("iron")) ||
    n.includes("wash & iron") ||
    n.includes("wash and iron")
  ) {
    return {
      Icon: TbIroningSteam,
      iconBg: "bg-card-pink",
      iconColor: "text-theme-gray-3",
      description: "For everyday laundry that requires ironing.",
    };
  }

  if (n.includes("iron") || n.includes("press")) {
    return {
      Icon: TbIroning,
      iconBg: "bg-[#FFD06D]",
      iconColor: "text-theme-gray-3",
      description: "For garments that need pressing or ironing only.",
    };
  }

  return {
    Icon: TbWash,
    iconBg: "bg-theme-blue-2",
    iconColor: "text-white",
    description: "For everyday laundry, bedsheets and towels.",
  };
}
