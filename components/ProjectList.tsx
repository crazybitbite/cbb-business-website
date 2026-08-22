import { ExternalLink } from "lucide-react"

export interface Project {
    id: string
    name: string
    description: string
    images?: string[]
    link?: string
    featured?: boolean
    category?: string
    subCategory?: string
    shortDescription?: string
}

interface ProjectListProps {
    projects?: Project[]
    total_columns?: number
    featured_only?: boolean
    total_rows?: number
    category?: string
}

export function ProjectList({ projects = [], total_columns = 3, featured_only = false, total_rows = 9, category = "all" }: ProjectListProps) {
    let filtered = projects
    if (category !== "all") filtered = filtered.filter(p => p.category === category)
    if (featured_only) filtered = filtered.filter(p => p.featured)
    filtered = filtered.slice(0, total_rows)
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${total_columns} gap-8`}>
            {filtered.length === 0 ? (
                <div className={`col-span-${total_columns} text-center text-gray-500 dark:text-gray-400 py-12`}>
                    No projects available at the moment.
                </div>
            ) : (
                filtered.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))
            )}
        </div>
    )
}

export function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 aspect-video shadow-sm dark:shadow-none transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600">
                {project.images && project.images.length > 0 ? (
                    <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                    <span>No Image</span>
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                <h3 className="text-2xl font-bold text-white mb-2">{project.name}</h3>
                <div className="text-gray-300 mb-4 line-clamp-2 prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: project.description }} />
                {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium">
                        View Project <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    )
}
