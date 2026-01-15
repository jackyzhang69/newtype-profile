import fs from "node:fs"
import path from "node:path"
import { createBuiltinSkills } from "../builtin-skills/skills"
import { parseFrontmatter } from "../../shared/frontmatter"
import { getClaudeConfigDir } from "../../shared"

type SkillFrontmatter = {
	name?: string
}

function buildSkillTemplate(body: string, baseDir: string): string {
	return `<skill-instruction>
Base directory for this skill: ${baseDir}/
File references (@path) in this skill are relative to this directory.

${body.trim()}
</skill-instruction>

<user-request>
$ARGUMENTS
</user-request>`
}

function resolveSkillFile(skillDir: string, skillName: string): string | null {
	const skillMdPath = path.join(skillDir, "SKILL.md")
	if (fs.existsSync(skillMdPath)) {
		return skillMdPath
	}
	const namedSkillPath = path.join(skillDir, `${skillName}.md`)
	if (fs.existsSync(namedSkillPath)) {
		return namedSkillPath
	}
	return null
}

function loadTemplateFromDir(skillDir: string, skillName: string): string | null {
	const skillFile = resolveSkillFile(skillDir, skillName)
	if (!skillFile) return null

	return loadTemplateFromFile(skillFile, skillDir)
}

function loadTemplateFromFile(skillFile: string, baseDir: string): string | null {
	const content = fs.readFileSync(skillFile, "utf-8")
	const { body, parseError } = parseFrontmatter<SkillFrontmatter>(content)
	if (parseError) return null

	return buildSkillTemplate(body, baseDir)
}

type ResolvedSkillFile = {
	skillFile: string
	baseDir: string
}

function resolveSkillFileFromRoot(skillsRoot: string, skillName: string): ResolvedSkillFile | null {
	if (!fs.existsSync(skillsRoot)) return null

	const entries = fs.readdirSync(skillsRoot, { withFileTypes: true })
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue

		if (entry.isDirectory() || entry.isSymbolicLink()) {
			const entryPath = path.join(skillsRoot, entry.name)
			const skillFile = resolveSkillFile(entryPath, entry.name)
			if (!skillFile) continue

			const content = fs.readFileSync(skillFile, "utf-8")
			const { data, parseError } = parseFrontmatter<SkillFrontmatter>(content)
			if (parseError) continue
			const resolvedName = data.name || entry.name
			if (resolvedName === skillName) {
				return { skillFile, baseDir: entryPath }
			}
		}

		if (entry.isFile() && entry.name.endsWith(".md")) {
			const skillFile = path.join(skillsRoot, entry.name)
			const content = fs.readFileSync(skillFile, "utf-8")
			const { data, parseError } = parseFrontmatter<SkillFrontmatter>(content)
			if (parseError) continue
			const fallbackName = entry.name.replace(/\.md$/, "")
			const resolvedName = data.name || fallbackName
			if (resolvedName === skillName) {
				return { skillFile, baseDir: skillsRoot }
			}
		}
	}

	return null
}

function resolveFilesystemSkillTemplate(skillName: string): string | null {
	const projectSkillsRoot = path.join(process.cwd(), ".claude", "skills")
	const userSkillsRoot = path.join(getClaudeConfigDir(), "skills")
	const hasProjectSkills = fs.existsSync(projectSkillsRoot)

	const projectMatch = resolveSkillFileFromRoot(projectSkillsRoot, skillName)
	if (projectMatch) {
		return loadTemplateFromFile(projectMatch.skillFile, projectMatch.baseDir)
	}

	if (hasProjectSkills) {
		return null
	}

	const userMatch = resolveSkillFileFromRoot(userSkillsRoot, skillName)
	if (userMatch) {
		return loadTemplateFromFile(userMatch.skillFile, userMatch.baseDir)
	}

	return null
}

export function resolveSkillContent(skillName: string): string | null {
	const filesystemTemplate = resolveFilesystemSkillTemplate(skillName)
	if (filesystemTemplate) return filesystemTemplate

	const skills = createBuiltinSkills()
	const skill = skills.find((s) => s.name === skillName)
	return skill?.template ?? null
}

export function resolveMultipleSkills(skillNames: string[]): {
	resolved: Map<string, string>
	notFound: string[]
} {
	const skills = createBuiltinSkills()
	const skillMap = new Map(skills.map((s) => [s.name, s.template]))

	const resolved = new Map<string, string>()
	const notFound: string[] = []

	for (const name of skillNames) {
		const filesystemTemplate = resolveFilesystemSkillTemplate(name)
		const template = filesystemTemplate ?? skillMap.get(name)
		if (template) {
			resolved.set(name, template)
		} else {
			notFound.push(name)
		}
	}

	return { resolved, notFound }
}
