import Link from "next/link";

import type { mediaFolders } from "@/db/schema";

export type MediaFolderRecord = typeof mediaFolders.$inferSelect;

interface FolderTreeProps {
  folders: MediaFolderRecord[];
  currentFolderId?: string | null;
}

interface FolderNode extends MediaFolderRecord {
  children: FolderNode[];
}

function buildTree(folders: MediaFolderRecord[]): FolderNode[] {
  const byId = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const folder of folders) {
    byId.set(folder.id, { ...folder, children: [] });
  }

  for (const folder of folders) {
    const node = byId.get(folder.id)!;
    if (folder.parentId && byId.has(folder.parentId)) {
      const parent = byId.get(folder.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortTree(n.children));
  };

  sortTree(roots);
  return roots;
}

function FolderTreeNode({ node, depth, currentFolderId }: { node: FolderNode; depth: number; currentFolderId?: string | null }) {
  const isActive = currentFolderId === node.id;

  return (
    <li>
      <Link
        href={`/admin/media?folderId=${node.id}`}
        className={`flex items-center rounded px-2 py-1 text-xs ${
          isActive ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "hover:bg-[var(--color-muted)]/10"
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {node.name}
      </Link>
      {node.children.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {node.children.map((child) => (
            <FolderTreeNode key={child.id} node={child} depth={depth + 1} currentFolderId={currentFolderId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FolderTree({ folders, currentFolderId }: FolderTreeProps) {
  const tree = buildTree(folders);

  return (
    <nav className="space-y-1 text-xs" aria-label="Media folders">
      <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Folders
      </div>
      <ul className="space-y-0.5">
        <li>
          <Link
            href="/admin/media"
            className={`flex items-center rounded px-2 py-1 text-xs ${
              !currentFolderId ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "hover:bg-[var(--color-muted)]/10"
            }`}
          >
            All media
          </Link>
        </li>
        {tree.map((node) => (
          <FolderTreeNode key={node.id} node={node} depth={0} currentFolderId={currentFolderId} />
        ))}
      </ul>
    </nav>
  );
}
