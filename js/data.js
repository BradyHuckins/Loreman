const TIPS = [
  "You don't need to know everything. \"Let me check and get back to you\" is a complete sentence.",
  "Say yes more than no. If a player's idea is fun, find a way to make it work — even if it's not optimal.",
  "Rule of cool beats rule of book. Especially while you're learning.",
  "The players will surprise you. Your best NPC will be the random shopkeeper you improvise. Lean into it.",
  "End sessions early rather than late. Better to leave them wanting more.",
  "Three factions is plenty. You can always add more — but you probably won't need to.",
  "Plan one session in detail. Outline the rest in bullet points.",
  "Every NPC wants something. Knowing the want is more important than knowing the backstory.",
  "Loose threads are gifts to your future self. Write them down the moment they appear."
];

const PITCH_POOL = [
  "The kingdom of Veyra is rotting from the inside — the king is dead, his heirs are at each other's throats, and something old is stirring in the mountains. You're a band of nobodies who happen to be in the wrong place at the right time.",
  "A wizard's tower appeared overnight in the middle of town. No one has entered. No one has left. The wizard who built it died two hundred years ago. Something inside is calling your names.",
  "The Empire fell ten years ago. You were children when it happened. Now strange signals are coming from the old capital, and someone needs to find out what's still alive in those ruins.",
  "A village has hired you to investigate why their dead won't stay buried. The priest blames a curse. The mayor blames bandits. The truth is much worse — and much older.",
  "You all owe a debt to the same dangerous man. He's offering to clear it in exchange for one job: escort his daughter across three hundred miles of hostile country. She doesn't want to go.",
  "Magic stopped working a year ago. Just stopped. Nobody knows why. You're among the last people who remember how things used to be — and you've just been hired to find out who's responsible.",
  "Your party are former soldiers from the losing side of a forgotten war. The treaty says you can never go home. A letter has arrived saying you must. Today.",
  "Something is stealing dreams. Not metaphorically — people wake up and they can't remember dreaming, and they're getting colder by the day. The Dreamwarden's Guild has run out of guildmembers to send.",
  "A festival in a quiet coastal town. A storm at sea. A ship that shouldn't have come back. The crew swears nothing is wrong. The town disagrees.",
  "A wandering hedge witch has died and left you everything in her will. You don't know her. You also don't know what 'everything' means yet."
];

const NPC_POOL = [
  { name: "Brother Aldric", role: "Quest-giver", description: "A drunk priest with kind eyes and trembling hands.", want: "Forgiveness for something he won't name." },
  { name: "Kara Vellis", role: "Ally", description: "A retired soldier turned innkeeper.", want: "To keep her past buried." },
  { name: "Thessaly Brand", role: "Antagonist", description: "A young noble too clever by half.", want: "Her brother's title and lands." },
  { name: "Old Tom", role: "Neutral", description: "The town crier who knows everyone's secrets.", want: "A drink, mostly." },
  { name: "The Pale Lady", role: "Mystery", description: "A figure glimpsed at crossroads, never up close.", want: "Something only she knows." },
  { name: "Garron Hex", role: "Quest-giver", description: "A traveling alchemist with a missing eye.", want: "Rare ingredients found only in dangerous places." },
  { name: "Mira Sundsen", role: "Neutral", description: "An overenthusiastic young scholar.", want: "To prove dragons still exist." },
  { name: "Roland Cope", role: "Ally", description: "A weary captain of the city watch.", want: "To retire before he gets killed." },
  { name: "The Hooded Man", role: "Antagonist", description: "Always at the edge of crowds, always watching.", want: "Something the party already has." },
  { name: "Lady Imogen Vye", role: "Quest-giver", description: "A noblewoman with too many enemies.", want: "To disappear cleanly." },
  { name: "Bram Cooperhew", role: "Comic relief", description: "A traveling cheese merchant with too many opinions.", want: "His missing prize wheel of Gorvian blue." },
  { name: "Sister Velka", role: "Ally", description: "A scarred warrior-priest of a dying faith.", want: "One last meaningful fight." }
];

const HOOK_POOL = [
  "A fire breaks out at the tavern where the party first meets.",
  "A stranger collapses at their feet with a sealed letter clutched in their hand.",
  "A bounty notice appears in town — with the party's faces on it.",
  "The carriage they're traveling in is ambushed at a river crossing.",
  "A child runs up to them screaming, points at something, then vanishes.",
  "The bell of the local temple rings at midnight, and it shouldn't have.",
  "A mutual friend has gone missing. They left only a note: \"Don't look for me.\"",
  "The local lord has summoned them by name. None of them know him.",
  "A storm forces them to share a barn with a stranger who watches them sleep.",
  "The body of a dead courier is found just outside town — with their names in his pocket."
];

const FACTION_POOL = [
  { name: "The Iron Council", want: "to install a puppet on the throne" },
  { name: "The Ashen Circle", want: "to keep the old king from returning" },
  { name: "The Gilded Hand", want: "to corner the trade routes through the mountain pass" },
  { name: "The Order of the Pale Flame", want: "to purify the kingdom by fire" },
  { name: "The Free Company of Ravensbrook", want: "to be hired by the highest bidder, no questions" },
  { name: "The Underroot", want: "to keep their existence beneath the city a secret" }
];

