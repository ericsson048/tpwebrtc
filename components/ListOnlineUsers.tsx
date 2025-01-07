"use client";
import { useSocket } from "@/context/socketContext";
import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

function ListOnlineUsers() {
  const { user } = useUser();
  const { onLineUsers, handleCall, handleGroupCall } = useSocket();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set()); // Set pour les utilisateurs sélectionnés

  const handleCheckboxChange = (userId: string) => {
    // Ajouter ou retirer un utilisateur de la sélection
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
    } else {
      newSelectedUsers.add(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleGroupCallClick = () => {
    // Convertir les utilisateurs sélectionnés en un tableau
    const groupParticipants = onLineUsers?.filter((user) => selectedUsers.has(user.userId));
    if (groupParticipants) {
      handleGroupCall(groupParticipants);
    }
  };

  return (
    <div className="flex flex-col w-full ">
     <div className="flex  items-center border-b border-b-primary/10 w-full py-2 gap-2">
     {onLineUsers &&
        onLineUsers.map((onLineUser) => {
          if (onLineUser.profile.id === user?.id) return null;

          return (
            <div
              className="flex relative items-center gap-2 cursor-pointer justify-between"
              key={onLineUser.userId}
            >
              <div className="flex flex-col items-center gap-2" onClick={()=>handleCall(onLineUser)}>
                <Avatar>
                  <AvatarImage src={onLineUser.profile?.imageUrl} />
                  <AvatarFallback>{onLineUser.profile?.firstName}</AvatarFallback>
                </Avatar>
                <div className="text-sm">{onLineUser.profile?.username?.split(" ")[0]}</div>
              </div>

              {/* Case à cocher pour l'appel de groupe */}
              <input
                type="checkbox"
                checked={selectedUsers.has(onLineUser.userId)}
                onChange={() => handleCheckboxChange(onLineUser.userId)}
                className="absolute top-0 left-0 rounded-full"
              />
            </div>
          );
        })}
     </div>
      <div className="mt-4">
        {/* Bouton pour appeler en groupe */}
        {selectedUsers.size > 0 && (
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleGroupCallClick}
          >
            Appel en groupe
          </button>
        )}
      </div>
    </div>
  );
}

export default ListOnlineUsers;
