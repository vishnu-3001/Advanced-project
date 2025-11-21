import classes from './Navigation.module.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Navigation(){
    const [selectedDisabilityID, setSelectedDisabilityID] = useState('');
    
    useEffect(() => {
        const selected = sessionStorage.getItem('disability');
        if(selected){
            setSelectedDisabilityID(JSON.parse(selected));
        }
    }, [])
    
    const navigate = useNavigate();
    
    const disabilities = [
        {id: '1', name: 'Dyslexia', icon: '📚', description: 'Reading & language processing difficulties'},
        {id: '2', name: 'Dysgraphia', icon: '✒️', description: 'Writing & fine motor skill challenges'},
        {id: '3', name: 'Dyscalculia', icon: '🧮', description: 'Mathematical reasoning difficulties'},
        {id: '4', name: 'ADHD', icon: '🎯', description: 'Attention & hyperactivity disorder'},
        {id: '5', name: 'APD', icon: '🎧', description: 'Auditory processing difficulties'},
        {id: '6', name: 'NVLD', icon: '🧩', description: 'Non-verbal learning challenges'},
        {id: '7', name: 'LPD', icon: '🗣️', description: 'Language processing difficulties'}
    ]
    
    function setDisability(id) {
        setSelectedDisabilityID(id);
        const selected = disabilities.find(disability => disability.id === id);
        if (selected) {
            sessionStorage.setItem('disability', JSON.stringify(selected.id));
        }
        navigate(`/disability/${id}/details`)
    }
    
    return(
        <div className={classes.NavigationContainer}>
            <div className={classes.appHeader}>
                <h1 className={classes.appTitle}>
                    <span className={classes.appIcon}>🎓</span>
                    Learning Disability Dashboard
                </h1>
                <p className={classes.appSubtitle}>
                    Understand how students with different learning needs approach math problems
                </p>
            </div>
            
            <div className={classes.problemGeneratorSection}>
                <button 
                    className={classes.problemGeneratorButton}
                    onClick={() => navigate('/')}
                    aria-label="Go to Math Problem Generator - the main starting point"
                >
                    <span className={classes.buttonIcon} aria-hidden="true">📚</span>
                    <span>Math Problem Generator</span>
                    <span className={classes.buttonSubtext}>Start Here - Step 1</span>
                </button>
            </div>
            
            <ul className={classes.NavigationList} aria-label="Learning disability types">
                <li className={`${classes.NavigationItem} ${classes.NavigationHeader}`} role="heading" aria-level="2">
                    <span className={classes.headerIcon}>🧩</span>
                    Select a Learning Disability
                    <span className={classes.headerSubtext}>Step 2</span>
                </li>
                {disabilities.map((disability) => (
                    <li 
                        key={disability.id} 
                        className={`${classes.NavigationItem} ${selectedDisabilityID === disability.id ? classes.selectedItem : ''}`}
                        onClick={() => setDisability(disability.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${disability.name}: ${disability.description}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setDisability(disability.id);
                            }
                        }}
                    >
                        <div className={classes.disabilityName}>
                            <span className={classes.disabilityIcon}>{disability.icon}</span>
                            <div className={classes.disabilityInfo}>
                                <span className={classes.disabilityTitle}>{disability.name}</span>
                                <span className={classes.disabilityDesc}>{disability.description}</span>
                            </div>
                        </div>
                        <div className={classes.arrow}>
                            {selectedDisabilityID === disability.id ? '→' : '›'}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Step 3: Tutor Session (moved from internal tabs) */}
            <div className={classes.identifierSection}>
                <button 
                    className={classes.problemGeneratorButton}
                    onClick={() => selectedDisabilityID ? navigate(`/disability/${selectedDisabilityID}/details/tutor`) : null}
                    aria-label="Start Tutor Session for selected disability"
                    disabled={!selectedDisabilityID}
                >
                    <span className={classes.buttonIcon} aria-hidden="true">💬</span>
                    <span>Start Tutor Session</span>
                    <span className={classes.buttonSubtext}>Step 3</span>
                </button>
            </div>
            
            <div className={classes.identifierSection}>
                <button 
                    className={classes.identifierButton}
                    onClick={() => navigate('/disability-identifier')}
                    aria-label="Open disability identifier tool"
                >
                    <span className={classes.buttonIcon} aria-hidden="true">🔍</span>
                    <span>Disability Identifier</span>
                </button>
            </div>
            
            <div className={classes.simulationSection}>
                <button 
                    className={classes.adaptiveButton}
                    onClick={() => navigate('/adaptive-difficulty')}
                >
                    <span className={classes.buttonIcon}>🎯</span>
                    <span>Adaptive Difficulty</span>
                </button>
                <button 
                    className={classes.whiteboardButton}
                    onClick={() => navigate('/whiteboard')}
                >
                    <span className={classes.buttonIcon}>🎨</span>
                    <span>Interactive Whiteboard</span>
                </button>
                {/* <button 
                    className={classes.navButton}
                    onClick={() => navigate('/analytics-dashboard')}
                >
                    <span className={classes.buttonIcon}>📊</span>
                    <span>Analytics Dashboard</span>
                </button> */}
                <button 
                    className={classes.navButton}
                    onClick={() => navigate('/ai-tutor-chat')}
                >
                    <span className={classes.buttonIcon}>💬</span>
                    <span>AI Tutor Chat</span>
                </button>
                <button 
                    className={classes.navButton}
                    onClick={() => navigate('/langgraph-workflow')}
                >
                    <span className={classes.buttonIcon}>🔄</span>
                    <span>LangGraph Workflow</span>
                </button>
            </div>
        </div>
    )
}
