import axios from "axios";

const BASE_URL = "http://localhost:5000/api/announcements";

export async function getAnnouncements() {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
}