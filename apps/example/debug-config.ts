import { config } from "./src/config/adminforge";

console.log("Config collections:");
config.collections.forEach(c => {
  console.log(`- ${c.name}: icon = ${c.icon}`);
});
