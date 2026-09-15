import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { fetchNotesGraph } from "../../notes/services/notes.api";
import { getApiErrorMessage } from "../../../lib/api";
import "../graph.scss";

const GRAPH_SIZE = 520;
const NODE_RADIUS = 34;

function buildPositions(nodes) {
    const center = GRAPH_SIZE / 2;
    const orbit = GRAPH_SIZE / 2 - NODE_RADIUS - 20;

    return nodes.map((node, index) => {
        const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
        return {
            ...node,
            x: center + Math.cos(angle) * orbit,
            y: center + Math.sin(angle) * orbit,
        };
    });
}

const GraphPage = () => {
    const navigate = useNavigate();
    const [graph, setGraph] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeNodeId, setActiveNodeId] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await fetchNotesGraph();
                setGraph(data.graph || { nodes: [], links: [] });
            } catch (err) {
                setError(getApiErrorMessage(err, "Failed to load concept graph"));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const positionedNodes = useMemo(
        () => buildPositions(graph.nodes || []),
        [graph.nodes]
    );

    const nodeMap = useMemo(() => {
        const map = new Map();
        positionedNodes.forEach((node) => map.set(node.id, node));
        return map;
    }, [positionedNodes]);

    const activeNode = positionedNodes.find((node) => node.id === activeNodeId);

    return (
        <section className="graph-page">
            <div className="graph-page-header">
                <div>
                    <h1>Concept graph</h1>
                    <p className="muted">
                        Visual map of how your notes connect through tags and AI links.
                    </p>
                </div>
                <Link to="/" className="button">Back to notes</Link>
            </div>

            {error && <p className="form-error">{error}</p>}
            {loading && <p className="muted">Loading graph...</p>}

            {!loading && graph.nodes.length === 0 && (
                <div className="empty-state">
                    <p>Create at least two notes to see relationships.</p>
                    <Link to="/notes/new" className="button primary-button">Create note</Link>
                </div>
            )}

            {!loading && graph.nodes.length > 0 && (
                <div className="graph-layout">
                    <svg
                        className="concept-graph"
                        viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`}
                        role="img"
                        aria-label="Concept graph"
                    >
                        {(graph.links || []).map((link) => {
                            const source = nodeMap.get(link.source);
                            const target = nodeMap.get(link.target);
                            if (!source || !target) return null;
                            return (
                                <line
                                    key={`${link.source}-${link.target}`}
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    className="graph-edge"
                                />
                            );
                        })}

                        {positionedNodes.map((node) => (
                            <g
                                key={node.id}
                                className={`graph-node ${activeNodeId === node.id ? "active" : ""}`}
                                onMouseEnter={() => setActiveNodeId(node.id)}
                                onMouseLeave={() => setActiveNodeId("")}
                                onClick={() => navigate(`/notes/${node.id}`)}
                            >
                                <circle cx={node.x} cy={node.y} r={NODE_RADIUS} />
                                <text x={node.x} y={node.y + 4}>
                                    {node.title.slice(0, 14)}
                                    {node.title.length > 14 ? "…" : ""}
                                </text>
                            </g>
                        ))}
                    </svg>

                    <aside className="graph-sidebar">
                        <h2>Connections</h2>
                        {graph.links.length === 0 && (
                            <p className="muted">
                                No links yet. Save notes with shared tags or refresh links from a note.
                            </p>
                        )}
                        <ul className="graph-link-list">
                            {(graph.links || []).map((link) => {
                                const source = nodeMap.get(link.source);
                                const target = nodeMap.get(link.target);
                                if (!source || !target) return null;
                                return (
                                    <li key={`${link.source}-${link.target}`}>
                                        <Link to={`/notes/${source.id}`}>{source.title}</Link>
                                        <span>↔</span>
                                        <Link to={`/notes/${target.id}`}>{target.title}</Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {activeNode && (
                            <div className="graph-node-detail">
                                <h3>{activeNode.title}</h3>
                                {activeNode.tags?.length > 0 && (
                                    <div className="note-tags">
                                        {activeNode.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <Link to={`/notes/${activeNode.id}`} className="button primary-button">
                                    Open note
                                </Link>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </section>
    );
};

export default GraphPage;
