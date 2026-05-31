"use server";

import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
import { StreamChat } from "stream-chat";

export async function getStreamUserToken(){
    const supabase = createClient(await cookies());
    const {data: {user}} = await supabase.auth.getUser();

    if(!user){
        return {success: false, error: "User is not authenticated"};
    }

    const {data: userData, error: userError} = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

    if(userError){
        console.error("Error fetching user data:", userError);
        throw new Error("Failed to fetch user data");
    }

    const serverClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_API_SECRET!
    );

    console.log(user.id);
    

    const token = serverClient.createToken(user.id);

    await serverClient.upsertUser({
        id: user?.id,
        name: userData.full_name,
        image: userData.avatar_url || undefined,
    });
    console.log("heeeeeeeelo");
    

    return {
        token,
        userId: user.id,
        userName: userData.full_name || undefined,
        userImage: userData.avatar_url || undefined
    }
}

export async function createOrGetChannel(otherUserId: string) {
    const supabase = createClient(await cookies());
    const {data: {user}} = await supabase.auth.getUser();

    if(!user){
        return {success: false, error: "User is not authenticated"};
    }

    const {data: matches, error: matchError} = await supabase
        .from("matches")
        .select("*")
        .or(
            `and(user1_id.eq.${user.id}, user2_id.eq.${otherUserId}), and(user1_id.eq.${otherUserId}, user2_id.eq.${user.id})`
        )
        .eq("is_active", true)
        .single();

    if(matchError || !matches){
        throw new Error("User are not matched. Cannot create a channel.");
    }

    const sortedIds = [user.id, otherUserId].sort();
    const combinedIds = sortedIds.join("_");

    // const channelId = `match_${combinedIds}`;
    const channelId = combinedIds.replace(/-/g, "").slice(0, 64);

    const serverClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_API_SECRET!
    );

    const {data: otherUserData, error: otherUserError} = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", otherUserId)
    .single();

    if(otherUserError){
        console.error("Error fetching user data:", otherUserError);
        throw new Error("Failed to fetch user data");
    }

    const channel = serverClient.channel("messaging", channelId, {
        members: [user.id, otherUserId],
        created_by_id: user.id
    });

    await serverClient.upsertUser({
        id: otherUserId,
        name: otherUserData.full_name,
        image: otherUserData.avatar_url || undefined,
    });

    try {
        await channel.create();
        console.log("Channel created successfully:", channelId);
    } catch (error) {
        console.log("Channel creation error:", error);

        if(error instanceof Error && !error.message.includes("already exists")){
            throw error;
        }
    }

    return {
        channelType: "messaging",
        channelId: channelId,
    }
}