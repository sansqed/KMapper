# KMapper
KMapper is a free and open-source Obsidian plugin that automatically generates Canvas-based concept maps from Obsidian notes using state-of-the-art GPT models and graph layout algorithms. KMapper can also optimize the layout of existing Canvas concept maps.

By leveraging GPT models, KMapper can extract import concepts and their relationships from bullet point-based and/or sentence-based notes written in Markdown. Users can customize the behavior of GPT by changing the prompt and providing examples using few-shot prompting. 

Supported GPT models
- GPT 3.5 Turbo 0125 (recommended)
- GPT 3.5 Turbo
- GPT 4 Turbo

Through ELK, a graph layout engine, KMapper can optimize the layout of concept maps to emphasize important concepts and improve readability. 

![[Pasted image 20240508005333.png]]
![[Pasted image 20240509024833.png]]
## 🎗️ Etymology
The name KMapper (pronounced as /ˈmæpər/) is derived from *knapping*, a process of manufacturing stone-based tools and producing flat surfaces from hard stones, such as obsidian, by repeatedly striking its surface until the desired shape is achieved. Like knapping, KMapper reduces Obsidian notes into its core concepts, revealing its underlying connections.
## ⭐ Features
- Automatically generate concept maps from Obsidian notes
- User-configurable prompts and few-shot prompting
- Optimize the layout of existing Canvas concept maps
## ⛔ Limitations
- Currently supports GPT models only. 
- The quality of the generated concept maps depend on the quality of the Obsidian notes. Only relationships explicitly stated in the notes will be extracted.
- Auto-layout of existing concept maps only support Canvas with text nodes only. Although running the command won't trigger any error if a group exists in the Canvas, it's layout won't be optimized.
## 🔧Getting started
### Installation
1. Clone this repo in `<vault dir>/.obsidian/plugins`
3. Open `Settings > Third-party plugins` and disable `Safe mode`
4. Activate KMapper in `Settings > Community plugins`
5. In `Settings > KMapper`, enter OpenAI API key
6. Descriptions of other settings can be found in the `KMapper settings` in this guide.
### Usage
**Generating concept maps**
1. Click KMapper in the ribbon OR search and select `KMapper: Generate knowledge map` in the command palette.
2. Select the files used to generate concept map. Multiple files can be selected.
3. Enter the path where the concept map will be generated.
4. Select the LLM to be used. It is recommended to use `GPT 3.5 Turbo 0125` or `GPT 4 Turbo`.
5. Additional options
	- `Open after generation` - if enabled, KMapper will automatically open the generated Canvas.
	- `Overwrite file if exist` - if disabled, KMapper will create a file with suffix `(1)`, `(2)`, etc.
6. Click the `Generate` button to generate. A progress bar will show along with the status of the generation process.
7. Once generated, you can modify the concept map to suite your needs. You can also optimize its layout (follow the instructions below)

> [!NOTE]
> Since GPT models are designed to return varying responses, every time a concept map is generated, a different set of concepts and relations will be returned. This is despite setting the model to the lowest temperature settings. *You may keep generating if the resulting concept map is not ideal.* 

**Optimizing layout of existing concept maps**
1. Open any Canvas file.
2. Search and select `KMapper: Optimize canvas layout` in the command palette. This option will only show if the active file is a Canvas.

**Other KMapper settings** 
- **OpenAI settings**
	- **Edit LLM prompt** - When toggled, this will show the **LLM prompt** settings. 
		- It is recommended to not modify the prompt since this will impact the behavior of KMapper. 
		- This option is provided for experimental purposes.
	- **LLM prompt** - This will be the prompt used in generating the concept-relation-concept triples. Follow the [prompting guide](KMapper_tips.md).
		- The guide also contains the default prompt. Copy this to reset the prompt to default.
	- **OpenAI examples** - These examples will guide the GPT models in the creating the ideal triples. Follow the [few-shot prompting guide](Kmapper_tips#Few-shot prompting).
		- **NOTE**: It is recommended to limit the number of examples to 2-3 examples to prevent exceeding the allowable tokens.
- **Graph layout settings**
	- **Minimum text box width** - This sets the minimum text box width in Canvas
	- **Maximum text box width** - This sets the maximum text box width in Canvas
	- **Graph spacing** - This sets the spacing of the text boxes with each other. It is recommended to set it at 100-150.

## 👾Debugging and possible errors
- To show the Devtools, press `ctrl + shift + I`
- Generating the concept maps will take, at most, 1 minute. If it takes longer than that, you can inspect the Devtools to check for any errors.
- When providing examples, OpenAI might return an error stating that the number of tokens have exceeded. When this is the case, you can
	- reduce the number of examples, or
	- reduce the length of the examples
- If you encounter any unexpected errors, contact the author.

## Building instructions
1. Install [Node.js](https://nodejs.org/en/download)
2. Run `npm i` on this repo's directory. This will install all packages used by KMapper.
3. Run `npm run build`