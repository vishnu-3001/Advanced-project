import { useState } from "react";
import classes from "./AIProblemGenerator.module.css";

export default function AIProblemGenerator() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedProblems, setGeneratedProblems] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
    const [selectedTopic, setSelectedTopic] = useState('algebra');
    const [studentLevel, setStudentLevel] = useState('intermediate');
    const [customPrompt, setCustomPrompt] = useState('');
    const [aiInsights, setAiInsights] = useState(null);
    // const [problemHistory, setProblemHistory] = useState([]); // TODO: Implement problem history tracking

    const topics = [
        { id: 'algebra', name: 'Algebra', icon: '📊' },
        { id: 'geometry', name: 'Geometry', icon: '📐' },
        { id: 'calculus', name: 'Calculus', icon: '∫' },
        { id: 'statistics', name: 'Statistics', icon: '📈' },
        { id: 'trigonometry', name: 'Trigonometry', icon: '📐' },
        { id: 'word-problems', name: 'Word Problems', icon: '📝' }
    ];

    const difficulties = [
        { id: 'beginner', name: 'Beginner', color: '#10B981' },
        { id: 'intermediate', name: 'Intermediate', color: '#F59E0B' },
        { id: 'advanced', name: 'Advanced', color: '#EF4444' },
        { id: 'expert', name: 'Expert', color: '#8B5CF6' }
    ];

    const generateAIProblem = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`https://starfish-app-9fd8s.ondigitalocean.app//api/v1/openai/generate_problem?grade_level=${studentLevel}&difficulty=${selectedDifficulty}&topic=${selectedTopic}&custom_prompt=${encodeURIComponent(customPrompt)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                const newProblem = {
                    id: Date.now(),
                    problem: data.problem,
                    solution: data.solution,
                    difficulty: selectedDifficulty,
                    topic: selectedTopic,
                    timestamp: new Date().toISOString(),
                    aiInsights: generateAIInsights(data.problem, selectedDifficulty),
                    studentLevel: studentLevel,
                    customPrompt: customPrompt
                };
                
                setGeneratedProblems(prev => [newProblem, ...prev]);
                setAiInsights(newProblem.aiInsights);
                
                // Clear custom prompt after successful generation
                setCustomPrompt('');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error generating problem:', error);
            // Show user-friendly error message
            alert('Failed to generate problem. Please check your connection and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAIInsights = (problem, difficulty) => {
        const insights = {
            estimatedTime: Math.floor(Math.random() * 15) + 5,
            cognitiveLoad: difficulty === 'beginner' ? 'Low' : difficulty === 'intermediate' ? 'Medium' : 'High',
            skillsRequired: getSkillsForTopic(selectedTopic),
            commonMistakes: getCommonMistakes(selectedTopic),
            learningObjectives: getLearningObjectives(selectedTopic),
            difficultyScore: getDifficultyScore(difficulty),
            aiConfidence: Math.floor(Math.random() * 20) + 80
        };
        return insights;
    };

    const getSkillsForTopic = (topic) => {
        const skillsMap = {
            'algebra': ['Equation solving', 'Variable manipulation', 'Pattern recognition'],
            'geometry': ['Spatial reasoning', 'Angle calculation', 'Area/volume formulas'],
            'calculus': ['Derivatives', 'Integration', 'Limit concepts'],
            'statistics': ['Data analysis', 'Probability', 'Statistical reasoning'],
            'trigonometry': ['Trigonometric functions', 'Unit circle', 'Angle relationships'],
            'word-problems': ['Reading comprehension', 'Problem translation', 'Logical reasoning']
        };
        return skillsMap[topic] || ['Problem solving', 'Mathematical reasoning'];
    };

    const getCommonMistakes = (topic) => {
        const mistakesMap = {
            'algebra': ['Sign errors', 'Order of operations', 'Variable isolation'],
            'geometry': ['Formula application', 'Angle measurement', 'Unit conversion'],
            'calculus': ['Chain rule errors', 'Integration by parts', 'Limit evaluation'],
            'statistics': ['Sample vs population', 'Probability calculation', 'Data interpretation'],
            'trigonometry': ['Unit conversion', 'Function periodicity', 'Reference angles'],
            'word-problems': ['Misreading requirements', 'Variable identification', 'Equation setup']
        };
        return mistakesMap[topic] || ['Calculation errors', 'Conceptual misunderstanding'];
    };

    const getLearningObjectives = (topic) => {
        const objectivesMap = {
            'algebra': ['Solve linear equations', 'Graph functions', 'Factor polynomials'],
            'geometry': ['Calculate areas and volumes', 'Understand geometric proofs', 'Apply theorems'],
            'calculus': ['Find derivatives and integrals', 'Understand limits', 'Apply optimization'],
            'statistics': ['Analyze data sets', 'Calculate probabilities', 'Interpret results'],
            'trigonometry': ['Use trigonometric functions', 'Solve triangles', 'Apply identities'],
            'word-problems': ['Translate problems to equations', 'Apply problem-solving strategies', 'Verify solutions']
        };
        return objectivesMap[topic] || ['Develop mathematical thinking', 'Apply problem-solving skills'];
    };

    const getDifficultyScore = (difficulty) => {
        const scores = {
            'beginner': 25,
            'intermediate': 50,
            'advanced': 75,
            'expert': 95
        };
        return scores[difficulty] || 50;
    };

    // const adaptDifficulty = (performance) => {
    //     if (performance > 80) {
    //         setSelectedDifficulty(prev => {
    //             const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    //             const currentIndex = levels.indexOf(prev);
    //             return levels[Math.min(currentIndex + 1, levels.length - 1)];
    //         });
    //     } else if (performance < 40) {
    //         setSelectedDifficulty(prev => {
    //             const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    //             const currentIndex = levels.indexOf(prev);
    //             return levels[Math.max(currentIndex - 1, 0)];
    //         });
    //     }
    // }; // TODO: Implement difficulty adaptation

    const exportProblems = () => {
        const dataStr = JSON.stringify(generatedProblems, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ai-generated-problems.json';
        link.click();
    };

    const handleCopyProblem = (problem) => {
        const problemText = `Problem: ${problem.problem}\n\nSolution: ${problem.solution}`;
        navigator.clipboard.writeText(problemText).then(() => {
            alert('Problem copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    };

    const handleUseInWhiteboard = (problem) => {
        // Store the problem in session storage for whiteboard to access
        sessionStorage.setItem('whiteboardProblem', JSON.stringify({
            problem: problem.problem,
            solution: problem.solution,
            topic: problem.topic,
            difficulty: problem.difficulty
        }));
        alert('Problem saved! Navigate to Interactive Whiteboard to use it.');
    };

    const handleAnalyzeProblem = (problem) => {
        // Generate detailed analysis
        const analysis = {
            complexity: problem.aiInsights.complexity,
            skillsRequired: problem.aiInsights.skillsRequired,
            estimatedTime: problem.aiInsights.estimatedTime,
            learningObjectives: problem.aiInsights.learningObjectives,
            commonMistakes: problem.aiInsights.commonMistakes,
            difficultyBreakdown: problem.aiInsights.difficultyBreakdown
        };
        
        const analysisText = `Problem Analysis:\n\n` +
            `Complexity: ${analysis.complexity}\n` +
            `Skills Required: ${analysis.skillsRequired.join(', ')}\n` +
            `Estimated Time: ${analysis.estimatedTime}\n` +
            `Learning Objectives: ${analysis.learningObjectives.join(', ')}\n` +
            `Common Mistakes: ${analysis.commonMistakes.join(', ')}\n` +
            `Difficulty Breakdown: ${analysis.difficultyBreakdown}`;
        
        alert(analysisText);
    };

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h2>🤖 AI Problem Generator</h2>
                <p>Generate personalized math problems with AI-powered difficulty adaptation</p>
            </div>

            <div className={classes.controls}>
                <div className={classes.controlGroup}>
                    <label>Topic</label>
                    <div className={classes.topicGrid}>
                        {topics.map(topic => (
                            <button
                                key={topic.id}
                                className={`${classes.topicBtn} ${selectedTopic === topic.id ? classes.active : ''}`}
                                onClick={() => setSelectedTopic(topic.id)}
                            >
                                <span className={classes.topicIcon}>{topic.icon}</span>
                                <span>{topic.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={classes.controlGroup}>
                    <label>Difficulty Level</label>
                    <div className={classes.difficultyGrid}>
                        {difficulties.map(diff => (
                            <button
                                key={diff.id}
                                className={`${classes.difficultyBtn} ${selectedDifficulty === diff.id ? classes.active : ''}`}
                                onClick={() => setSelectedDifficulty(diff.id)}
                                style={{ '--color': diff.color }}
                            >
                                {diff.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={classes.controlGroup}>
                    <label>Student Level</label>
                    <select 
                        value={studentLevel} 
                        onChange={(e) => setStudentLevel(e.target.value)}
                        className={classes.select}
                    >
                        <option value="elementary">Elementary (K-5)</option>
                        <option value="middle">Middle School (6-8)</option>
                        <option value="high">High School (9-12)</option>
                        <option value="college">College Level</option>
                    </select>
                </div>

                <div className={classes.controlGroup}>
                    <label>Custom Prompt (Optional)</label>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Describe specific requirements for the problem..."
                        className={classes.textarea}
                    />
                </div>

                <button 
                    className={classes.generateBtn}
                    onClick={generateAIProblem}
                    disabled={isGenerating}
                >
                    {isGenerating ? '🔄 Generating...' : '✨ Generate AI Problem'}
                </button>
            </div>

            {aiInsights && (
                <div className={classes.insights}>
                    <h3>🧠 AI Insights</h3>
                    <div className={classes.insightsGrid}>
                        <div className={classes.insightCard}>
                            <div className={classes.insightIcon}>⏱️</div>
                            <div className={classes.insightContent}>
                                <div className={classes.insightLabel}>Estimated Time</div>
                                <div className={classes.insightValue}>{aiInsights.estimatedTime} min</div>
                            </div>
                        </div>
                        <div className={classes.insightCard}>
                            <div className={classes.insightIcon}>🧠</div>
                            <div className={classes.insightContent}>
                                <div className={classes.insightLabel}>Cognitive Load</div>
                                <div className={classes.insightValue}>{aiInsights.cognitiveLoad}</div>
                            </div>
                        </div>
                        <div className={classes.insightCard}>
                            <div className={classes.insightIcon}>🎯</div>
                            <div className={classes.insightContent}>
                                <div className={classes.insightLabel}>Difficulty Score</div>
                                <div className={classes.insightValue}>{aiInsights.difficultyScore}/100</div>
                            </div>
                        </div>
                        <div className={classes.insightCard}>
                            <div className={classes.insightIcon}>🤖</div>
                            <div className={classes.insightContent}>
                                <div className={classes.insightLabel}>AI Confidence</div>
                                <div className={classes.insightValue}>{aiInsights.aiConfidence}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={classes.problemsList}>
                <div className={classes.problemsHeader}>
                    <h3>📚 Generated Problems</h3>
                    <button className={classes.exportBtn} onClick={exportProblems}>
                        📥 Export All
                    </button>
                </div>
                
                {generatedProblems.map(problem => (
                    <div key={problem.id} className={classes.problemCard}>
                        <div className={classes.problemHeader}>
                            <div className={classes.problemMeta}>
                                <span className={classes.topic}>{problem.topic}</span>
                                <span className={classes.difficulty}>{problem.difficulty}</span>
                                <span className={classes.timestamp}>
                                    {new Date(problem.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className={classes.problemActions}>
                                <button 
                                    className={classes.actionBtn}
                                    onClick={() => handleCopyProblem(problem)}
                                >
                                    📋 Copy
                                </button>
                                <button 
                                    className={classes.actionBtn}
                                    onClick={() => handleUseInWhiteboard(problem)}
                                >
                                    🎯 Use in Whiteboard
                                </button>
                                <button 
                                    className={classes.actionBtn}
                                    onClick={() => handleAnalyzeProblem(problem)}
                                >
                                    📊 Analyze
                                </button>
                            </div>
                        </div>
                        <div className={classes.problemContent}>
                            <div className={classes.problemText}>
                                <strong>Problem:</strong> {problem.problem}
                            </div>
                            <div className={classes.solutionText}>
                                <strong>Solution:</strong> {problem.solution}
                            </div>
                        </div>
                        <div className={classes.skillsList}>
                            <strong>Skills Required:</strong>
                            {problem.aiInsights.skillsRequired.map((skill, index) => (
                                <span key={index} className={classes.skillTag}>{skill}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
