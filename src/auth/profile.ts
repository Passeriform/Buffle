const USER_PROFILE_KEY = "user_profile"

type UserProfile = {
    name: string
    taunt: string
}

export const getUserProfile = () => {
    const existingProfile = localStorage.getItem(USER_PROFILE_KEY)

    if (existingProfile) {
        try {
            return JSON.parse(existingProfile) as UserProfile
        } catch (ex) {
            throw new Error(`Error occurred while loading the profile: ${ex}`)
        }
    }

    const newProfile = {
        name: "BUFFLE",
        taunt: "",
    }

    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile))

    return newProfile
}

export const updateUserProfile = async (update: Partial<UserProfile>) => {
    const profile = getUserProfile()

    const updatedProfile = { ...profile, ...update }

    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile))
}
