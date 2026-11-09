import gramado from "@/assets/gramado.jpg";
import buenosAires from "@/assets/buenos-aires.jpg";
import paris from "@/assets/paris.jpg";
const map: [RegExp, string][] = [[/gramado|serra/i, gramado], [/buenos|argentin/i, buenosAires], [/paris|fran[cç]a/i, paris]];
export const tripImage = (destination: string) => map.find(([r]) => r.test(destination))?.[1] ?? null;
