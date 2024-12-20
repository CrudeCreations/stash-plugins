import fs from "fs";
import yaml from "js-yaml";
import fetch from "node-fetch";

const pluginsConfig:any = yaml.load(fs.readFileSync('plugins.yml').toString());

async function fetchYAML(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    return yaml.load(text);
}

async function generatePluginLists() {
    const stablePlugins = [];
    const devPlugins = [];

    for (const plugin of pluginsConfig.plugins) {
        if (plugin.stable) {
            try {
                const data = await fetchYAML(plugin.stable);
                stablePlugins.push(data);
            } catch (error) {
                console.error(`Failed to fetch stable plugin from ${plugin.stable}:`, error);
            }
        }
        
        if (plugin.dev) {
            try {
                const data = await fetchYAML(plugin.dev);
                devPlugins.push(data);
            } catch (error) {
                console.error(`Failed to fetch dev plugin from ${plugin.dev}:`, error);
            }
        }
    }
    fs.mkdirSync('_site/stable', {recursive: true});
    fs.mkdirSync('_site/dev', {recursive: true});
    fs.writeFileSync('_site/stable/plugins.yaml', yaml.dump(stablePlugins));
    fs.writeFileSync('_site/dev/plugins.yaml', yaml.dump(devPlugins));

    console.log('Generated plugins.yaml for stable and dev versions');
}

generatePluginLists().catch(err => console.error(err));