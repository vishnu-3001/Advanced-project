import InternalNavigation from "./InternalNavigation";
import { Outlet } from "react-router-dom";

export default function DetailsLayout() {
  return (
    <div>
      <InternalNavigation />
      <Outlet /> {/* This renders nested routes like <Description /> */}
    </div>
  );
}
