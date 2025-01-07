import CallNotification from "@/components/CallNotification";
import ListOnlineUsers from "@/components/ListOnlineUsers";
import VideoCall from "@/components/VideoCall";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <ListOnlineUsers/>
      <CallNotification/>
      <VideoCall/>
    </div>
  );
}
