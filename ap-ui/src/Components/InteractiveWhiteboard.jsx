import { useState, useEffect, useRef } from "react";
import classes from "./InteractiveWhiteboard.module.css";

export default function InteractiveWhiteboard() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('pen');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentSize, setCurrentSize] = useState(2);
    const [shapes, setShapes] = useState([]);
    const [manipulatives, setManipulatives] = useState([]);
    const [isCollaborating, setIsCollaborating] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [problemText, setProblemText] = useState('');
    const [solutionSteps, setSolutionSteps] = useState([]);
    
    // Advanced features
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [layers, setLayers] = useState([{ id: 1, name: 'Layer 1', visible: true, locked: false }]);
    // const [activeLayer, setActiveLayer] = useState(1); // TODO: Implement layer switching
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState([]);
    const [showEquationEditor, setShowEquationEditor] = useState(false);
    const [equations, setEquations] = useState([]);
    const [liveCursors, setLiveCursors] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;

        // Set canvas size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [currentColor, currentSize]);

    // Live collaboration simulation
    useEffect(() => {
        if (isCollaborating) {
            const interval = setInterval(simulateLiveCollaboration, 2000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCollaborating, liveCursors]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        redo();
                        break;
                    case 's':
                        e.preventDefault();
                        saveWork();
                        break;
                    case '=':
                    case '+':
                        e.preventDefault();
                        zoomIn();
                        break;
                    case '-':
                        e.preventDefault();
                        zoomOut();
                        break;
                    case '0':
                        e.preventDefault();
                        resetZoom();
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyIndex, history.length]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        
        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = currentSize * 3; // Make eraser bigger
        } else if (currentTool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.font = `${currentSize * 4}px Arial`;
                ctx.fillStyle = currentColor;
                ctx.fillText(text, x, y);
            }
            return; // Don't continue with drawing for text
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentSize;
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing || currentTool === 'text') return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        saveToHistory();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setShapes([]);
    };

    const addShape = (shapeType) => {
        const newShape = {
            id: Date.now(),
            type: shapeType,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            color: currentColor,
            size: currentSize
        };
        setShapes([...shapes, newShape]);
    };

    const addManipulative = (type) => {
        const manipulative = {
            id: Date.now(),
            type: type,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            value: type === 'number' ? Math.floor(Math.random() * 20) + 1 : type,
            color: getManipulativeColor(type)
        };
        setManipulatives([...manipulatives, manipulative]);
    };

    const getManipulativeColor = (type) => {
        const colors = {
            'number': '#4F46E5',
            'plus': '#10B981',
            'minus': '#EF4444',
            'multiply': '#F59E0B',
            'divide': '#8B5CF6',
            'equals': '#6B7280'
        };
        return colors[type] || '#000000';
    };

    const addSolutionStep = (step) => {
        const newStep = {
            id: Date.now(),
            text: step,
            timestamp: new Date().toLocaleTimeString()
        };
        setSolutionSteps([...solutionSteps, newStep]);
    };

    const startCollaboration = () => {
        setIsCollaborating(true);
        // In a real implementation, this would connect to a WebSocket or similar
        setCollaborators([
            { id: 1, name: 'Tutor', color: '#4F46E5', isActive: true },
            { id: 2, name: 'Student', color: '#10B981', isActive: false }
        ]);
    };

    const stopCollaboration = () => {
        setIsCollaborating(false);
        setCollaborators([]);
    };

    // Advanced features functions
    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const imageData = canvas.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = history[historyIndex - 1];
            }
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = history[historyIndex + 1];
            }
        }
    };

    const addLayer = () => {
        const newLayer = {
            id: Date.now(),
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false
        };
        setLayers([...layers, newLayer]);
    };

    const toggleLayerVisibility = (layerId) => {
        setLayers(layers.map(layer => 
            layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        ));
    };

    const toggleLayerLock = (layerId) => {
        setLayers(layers.map(layer => 
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
        ));
    };

    const startRecording = () => {
        setIsRecording(true);
        const recording = {
            id: Date.now(),
            startTime: new Date(),
            actions: []
        };
        setRecordings([...recordings, recording]);
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    const addEquation = (latex) => {
        const equation = {
            id: Date.now(),
            latex: latex,
            x: 100,
            y: 100
        };
        setEquations([...equations, equation]);
    };

    const exportToPDF = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = 'whiteboard-export.pdf';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const exportToImage = (format = 'png') => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = `whiteboard-export.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
    };

    const zoomIn = () => {
        setZoomLevel(Math.min(zoomLevel * 1.2, 3));
    };

    const zoomOut = () => {
        setZoomLevel(Math.max(zoomLevel / 1.2, 0.3));
    };

    const resetZoom = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const startPan = (e) => {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+left click
            setIsPanning(true);
            setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const pan = (e) => {
        if (!isPanning) return;
        
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        
        setPanOffset({
            x: panOffset.x + deltaX,
            y: panOffset.y + deltaY
        });
        
        setLastPanPoint({ x: e.clientX, y: e.clientY });
    };

    const stopPan = () => {
        setIsPanning(false);
    };

    const simulateLiveCollaboration = () => {
        if (!isCollaborating) return;
        
        const newCursor = {
            id: Date.now(),
            x: Math.random() * 800,
            y: Math.random() * 600,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            name: `User ${Math.floor(Math.random() * 5) + 1}`
        };
        
        setLiveCursors([...liveCursors, newCursor]);
        
        setTimeout(() => {
            setLiveCursors(liveCursors.filter(cursor => cursor.id !== newCursor.id));
        }, 3000);
    };

    const saveWork = () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        
        // Save to localStorage
        const whiteboardData = {
            canvas: dataURL,
            shapes: shapes,
            manipulatives: manipulatives,
            problemText: problemText,
            solutionSteps: solutionSteps,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('whiteboardData', JSON.stringify(whiteboardData));
        alert('Work saved successfully!');
    };

    const loadWork = () => {
        const savedData = localStorage.getItem('whiteboardData');
        if (savedData) {
            const data = JSON.parse(savedData);
            setShapes(data.shapes || []);
            setManipulatives(data.manipulatives || []);
            setProblemText(data.problemText || '');
            setSolutionSteps(data.solutionSteps || []);
            
            // Load canvas image
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
            };
            img.src = data.canvas;
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <div className={classes.icon}>🎨</div>
                    Interactive Whiteboard
                </div>
                <p className={classes.subtitle}>
                    Visual problem-solving workspace with math manipulatives
                </p>
            </div>

            <div className={classes.workspace}>
                {/* Toolbar */}
                <div className={classes.toolbar}>
                    <div className={classes.toolGroup}>
                        <h4>Drawing Tools</h4>
                        <div className={classes.tools}>
                            <button 
                                className={`${classes.tool} ${currentTool === 'pen' ? classes.active : ''}`}
                                onClick={() => setCurrentTool('pen')}
                            >
                                ✏️ Pen
                            </button>
                            <button 
                                className={`${classes.tool} ${currentTool === 'eraser' ? classes.active : ''}`}
                                onClick={() => setCurrentTool('eraser')}
                            >
                                🧹 Eraser
                            </button>
                            <button 
                                className={`${classes.tool} ${currentTool === 'text' ? classes.active : ''}`}
                                onClick={() => setCurrentTool('text')}
                            >
                                📝 Text
                            </button>
                        </div>
                        <div className={classes.toolInfo}>
                            {currentTool === 'pen' && <span>✏️ Draw with pen</span>}
                            {currentTool === 'eraser' && <span>🧹 Erase content</span>}
                            {currentTool === 'text' && <span>📝 Click to add text</span>}
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Colors</h4>
                        <div className={classes.colors}>
                            {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                                <button
                                    key={color}
                                    className={`${classes.colorBtn} ${currentColor === color ? classes.active : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setCurrentColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Size</h4>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={currentSize}
                            onChange={(e) => setCurrentSize(parseInt(e.target.value))}
                            className={classes.sizeSlider}
                        />
                        <span>{currentSize}px</span>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Shapes</h4>
                        <div className={classes.tools}>
                            <button className={classes.tool} onClick={() => addShape('circle')}>
                                ⭕ Circle
                            </button>
                            <button className={classes.tool} onClick={() => addShape('rectangle')}>
                                ⬜ Rectangle
                            </button>
                            <button className={classes.tool} onClick={() => addShape('line')}>
                                📏 Line
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Math Tools</h4>
                        <div className={classes.tools}>
                            <button className={classes.tool} onClick={() => addManipulative('number')}>
                                🔢 Number
                            </button>
                            <button className={classes.tool} onClick={() => addManipulative('plus')}>
                                ➕ Plus
                            </button>
                            <button className={classes.tool} onClick={() => addManipulative('minus')}>
                                ➖ Minus
                            </button>
                            <button className={classes.tool} onClick={() => addManipulative('multiply')}>
                                ✖️ Multiply
                            </button>
                            <button className={classes.tool} onClick={() => addManipulative('divide')}>
                                ➗ Divide
                            </button>
                            <button className={classes.tool} onClick={() => addManipulative('equals')}>
                                ⚖️ Equals
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>History</h4>
                        <div className={classes.tools}>
                            <button 
                                className={classes.tool} 
                                onClick={undo}
                                disabled={historyIndex <= 0}
                            >
                                ↶ Undo
                            </button>
                            <button 
                                className={classes.tool} 
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                            >
                                ↷ Redo
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>View Controls</h4>
                        <div className={classes.tools}>
                            <button className={classes.tool} onClick={zoomIn}>
                                🔍+ Zoom In
                            </button>
                            <button className={classes.tool} onClick={zoomOut}>
                                🔍- Zoom Out
                            </button>
                            <button className={classes.tool} onClick={resetZoom}>
                                🎯 Reset View
                            </button>
                        </div>
                        <div className={classes.zoomDisplay}>
                            Zoom: {Math.round(zoomLevel * 100)}%
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Export</h4>
                        <div className={classes.tools}>
                            <button className={classes.tool} onClick={exportToPDF}>
                                📄 Export PDF
                            </button>
                            <button className={classes.tool} onClick={() => exportToImage('png')}>
                                🖼️ Export PNG
                            </button>
                            <button className={classes.tool} onClick={() => exportToImage('jpg')}>
                                📷 Export JPG
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Recording</h4>
                        <div className={classes.tools}>
                            <button 
                                className={`${classes.tool} ${isRecording ? classes.recording : ''}`}
                                onClick={isRecording ? stopRecording : startRecording}
                            >
                                {isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
                            </button>
                        </div>
                        {recordings.length > 0 && (
                            <div className={classes.recordingsList}>
                                {recordings.map(recording => (
                                    <div key={recording.id} className={classes.recordingItem}>
                                        📹 Recording {recording.id}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Math Tools</h4>
                        <div className={classes.tools}>
                            <button 
                                className={classes.tool}
                                onClick={() => setShowEquationEditor(!showEquationEditor)}
                            >
                                📐 Equation Editor
                            </button>
                            <button className={classes.tool} onClick={() => addEquation('x^2 + y^2 = r^2')}>
                                ⭕ Circle Equation
                            </button>
                            <button className={classes.tool} onClick={() => addEquation('y = mx + b')}>
                                📈 Linear Equation
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Layers</h4>
                        <div className={classes.layersList}>
                            {layers.map(layer => (
                                <div key={layer.id} className={classes.layerItem}>
                                    <div className={classes.layerControls}>
                                        <button 
                                            className={classes.layerBtn}
                                            onClick={() => toggleLayerVisibility(layer.id)}
                                        >
                                            {layer.visible ? '👁️' : '🙈'}
                                        </button>
                                        <button 
                                            className={classes.layerBtn}
                                            onClick={() => toggleLayerLock(layer.id)}
                                        >
                                            {layer.locked ? '🔒' : '🔓'}
                                        </button>
                                        <span className={classes.layerName}>{layer.name}</span>
                                    </div>
                                </div>
                            ))}
                            <button className={classes.tool} onClick={addLayer}>
                                ➕ Add Layer
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Actions</h4>
                        <div className={classes.tools}>
                            <button className={classes.tool} onClick={clearCanvas}>
                                🗑️ Clear Canvas
                            </button>
                            <button className={classes.tool} onClick={saveWork}>
                                💾 Save Work
                            </button>
                            <button className={classes.tool} onClick={loadWork}>
                                📂 Load Work
                            </button>
                        </div>
                    </div>

                    <div className={classes.toolGroup}>
                        <h4>Quick Actions</h4>
                        <div className={classes.tools}>
                            <button className={classes.tool} onClick={() => addShape('circle')}>
                                ⭕ Add Circle
                            </button>
                            <button className={classes.tool} onClick={() => addShape('rectangle')}>
                                ⬜ Add Rectangle
                            </button>
                            <button className={classes.tool} onClick={() => addManipulative('number')}>
                                🔢 Add Number
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className={classes.mainArea}>
                    {/* Canvas Controls */}
                    <div className={classes.canvasControls}>
                        <button className={classes.clearSlideBtn} onClick={clearCanvas}>
                            🗑️ Clear Slide
                        </button>
                        <div className={classes.currentToolDisplay}>
                            Current Tool: {currentTool === 'pen' ? '✏️ Pen' : 
                                         currentTool === 'eraser' ? '🧹 Eraser' : 
                                         currentTool === 'text' ? '📝 Text' : 'Unknown'}
                        </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div className={classes.canvasArea}>
                        {/* Canvas */}
                        <div className={classes.canvasContainer}>
                            <canvas
                                ref={canvasRef}
                                className={classes.canvas}
                                style={{ 
                                    cursor: currentTool === 'eraser' ? 'grab' : 
                                           currentTool === 'text' ? 'text' : 
                                           'crosshair',
                                    transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                                    transformOrigin: '0 0'
                                }}
                                onMouseDown={(e) => {
                                    startDrawing(e);
                                    startPan(e);
                                }}
                                onMouseMove={(e) => {
                                    draw(e);
                                    pan(e);
                                }}
                                onMouseUp={(e) => {
                                    stopDrawing();
                                    stopPan();
                                }}
                                onMouseLeave={() => {
                                    stopDrawing();
                                    stopPan();
                                }}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    if (e.deltaY < 0) {
                                        zoomIn();
                                    } else {
                                        zoomOut();
                                    }
                                }}
                            />
                            
                            {/* Live Cursors */}
                            {liveCursors.map(cursor => (
                                <div
                                    key={cursor.id}
                                    className={classes.liveCursor}
                                    style={{
                                        left: cursor.x,
                                        top: cursor.y,
                                        color: cursor.color
                                    }}
                                >
                                    <div className={classes.cursorPointer}></div>
                                    <span className={classes.cursorName}>{cursor.name}</span>
                                </div>
                            ))}
                            
                            {/* Equations */}
                            {equations.map(equation => (
                                <div
                                    key={equation.id}
                                    className={classes.equation}
                                    style={{
                                        left: equation.x,
                                        top: equation.y
                                    }}
                                >
                                    <div className={classes.equationContent}>
                                        {equation.latex}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Render shapes */}
                            {shapes.map(shape => (
                                <div
                                    key={shape.id}
                                    className={classes.shape}
                                    style={{
                                        left: shape.x,
                                        top: shape.y,
                                        color: shape.color,
                                        fontSize: shape.size * 2
                                    }}
                                >
                                    {shape.type === 'circle' && '⭕'}
                                    {shape.type === 'rectangle' && '⬜'}
                                    {shape.type === 'line' && '📏'}
                                </div>
                            ))}

                            {/* Render manipulatives */}
                            {manipulatives.map(manip => (
                                <div
                                    key={manip.id}
                                    className={classes.manipulative}
                                    style={{
                                        left: manip.x,
                                        top: manip.y,
                                        backgroundColor: manip.color,
                                        color: 'white'
                                    }}
                                    draggable
                                >
                                    {manip.type === 'number' ? manip.value : manip.type}
                                </div>
                            ))}
                        </div>

                        {/* Side Panel */}
                        <div className={classes.sidePanel}>
                            {/* Problem Input */}
                            <div className={classes.section}>
                                <h4>Problem Statement</h4>
                                <textarea
                                    value={problemText}
                                    onChange={(e) => setProblemText(e.target.value)}
                                    placeholder="Enter the math problem here..."
                                    className={classes.problemInput}
                                />
                            </div>

                            {/* Solution Steps */}
                            <div className={classes.section}>
                                <h4>Solution Steps</h4>
                                <div className={classes.stepInput}>
                                    <input
                                        type="text"
                                        placeholder="Add a solution step..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                addSolutionStep(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        className={classes.stepField}
                                    />
                                </div>
                                <div className={classes.stepsList}>
                                    {solutionSteps.map(step => (
                                        <div key={step.id} className={classes.step}>
                                            <span className={classes.stepTime}>{step.timestamp}</span>
                                            <span className={classes.stepText}>{step.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Collaboration */}
                            <div className={classes.section}>
                                <h4>Collaboration</h4>
                                {!isCollaborating ? (
                                    <button 
                                        className={classes.collabBtn}
                                        onClick={startCollaboration}
                                    >
                                        🤝 Start Collaboration
                                    </button>
                                ) : (
                                    <div className={classes.collaboration}>
                                        <div className={classes.collaborators}>
                                            {collaborators.map(collab => (
                                                <div 
                                                    key={collab.id} 
                                                    className={`${classes.collaborator} ${collab.isActive ? classes.active : ''}`}
                                                >
                                                    <div 
                                                        className={classes.collaboratorColor}
                                                        style={{ backgroundColor: collab.color }}
                                                    />
                                                    <span>{collab.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            className={classes.stopCollabBtn}
                                            onClick={stopCollaboration}
                                        >
                                            Stop Collaboration
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Equation Editor Modal */}
            {showEquationEditor && (
                <div className={classes.modalOverlay}>
                    <div className={classes.equationModal}>
                        <div className={classes.modalHeader}>
                            <h3>📐 Equation Editor</h3>
                            <button 
                                className={classes.closeBtn}
                                onClick={() => setShowEquationEditor(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={classes.modalContent}>
                            <div className={classes.equationTemplates}>
                                <h4>Quick Templates:</h4>
                                <div className={classes.templateGrid}>
                                    <button 
                                        className={classes.templateBtn}
                                        onClick={() => addEquation('x^2 + y^2 = r^2')}
                                    >
                                        Circle
                                    </button>
                                    <button 
                                        className={classes.templateBtn}
                                        onClick={() => addEquation('y = mx + b')}
                                    >
                                        Linear
                                    </button>
                                    <button 
                                        className={classes.templateBtn}
                                        onClick={() => addEquation('ax^2 + bx + c = 0')}
                                    >
                                        Quadratic
                                    </button>
                                    <button 
                                        className={classes.templateBtn}
                                        onClick={() => addEquation('sin(x) = cos(x)')}
                                    >
                                        Trigonometry
                                    </button>
                                    <button 
                                        className={classes.templateBtn}
                                        onClick={() => addEquation('∫ f(x) dx')}
                                    >
                                        Integral
                                    </button>
                                    <button 
                                        className={classes.templateBtn}
                                        onClick={() => addEquation('lim(x→0) f(x)')}
                                    >
                                        Limit
                                    </button>
                                </div>
                            </div>
                            <div className={classes.customEquation}>
                                <h4>Custom Equation:</h4>
                                <input
                                    type="text"
                                    placeholder="Enter LaTeX equation..."
                                    className={classes.equationInput}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            addEquation(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
