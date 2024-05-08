import { Vector3 } from "three";
export const rooms = [
  {
    id: "living-room",
    name: "客厅",
    position: new Vector3(0, 0, 0),
    map: "/images/map/map_living_room.jpg"
  },
  {
    id: "bed-room",
    name: "卧室",
    position: new Vector3(-32, 0, 0),
    map: "/images/map/map_bed_room.jpg"
  },
  {
    id: "book-room",
    name: "书房",
    position: new Vector3(32, 0, 0),
    map: "/images/map/map_study_room.jpg"
  }
];
