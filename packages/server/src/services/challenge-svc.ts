import { Challenge } from "../models/index.ts";

const challenges: { [key: string]: Challenge } = {
  gym: {
    id: "gym",
    title: "Gym Challenge",
    description: "A challenge page for gym activities.",
    image: "/images/gym.jpg",
    link: "/gym-challenge.html"
  },
  mindfulness: {
    id: "mindfulness",
    title: "Mindfulness Challenge",
    description: "A challenge page for mindfulness activities.",
    image: "/images/mindfulness.jpg",
    link: "/mindfulness-challenge.html"
  }
};

function get(id: string): Challenge | undefined {
  return challenges[id];
}

export default { get };
