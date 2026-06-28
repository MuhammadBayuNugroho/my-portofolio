"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden p-0" hoverEffect={true}>
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-background-overlay border-b border-border/60 group">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="primary">{project.category}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <span className="text-xs text-foreground-subtle mb-1.5 font-medium">
          {new Date(project.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
          })}
        </span>
        
        <Link href={`/projects/${project.slug}`} className="hover:underline">
          <h3 className="font-display text-h3 text-foreground font-semibold mb-2 line-clamp-1">
            {project.title}
          </h3>
        </Link>

        <p className="text-xs text-foreground-muted line-clamp-2 mb-4 leading-relaxed flex-1">
          {project.description}
        </p>

        {/* Tech Stack tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            Lihat Studi Kasus →
          </Link>
          
          <div className="flex items-center gap-3 text-foreground-muted">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                title="Source Code"
              >
                <Github size={16} />
              </a>
            )}
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                title="Live Demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
