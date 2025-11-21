import { Routes, Route } from "react-router-dom";
import DetailsLayout from "./DetailsLayout";
import Description from "./Description";
import Attempt from "./Attempt";
import Strategies from "./Strategies";
import Tutor from "./Tutor";
import Thought from "./Thought";
import Improvement from "./Improvement";

export default function Details() {
  return (
    <Routes>
      <Route path="/" element={<DetailsLayout />}>
        <Route path="description" element={<Description />} />
        <Route path="attempt" element={<Attempt />} />
        <Route path="thought" element={<Thought />} />
        <Route path="tutor" element={<Tutor />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="improvement" element={<Improvement/>}/>
      </Route>
    </Routes>
  );
}
