import TagCloud from 'TagCloud';

const initCloud = (selector, texts, color) => {
    const el = document.querySelector(selector);
    if (!el || el.innerHTML.trim() !== '') return;

    const options = {
        radius: 180,
        maxSpeed: 'normal',
        initSpeed: 'normal',
        direction: 135,
        keep: true,
        useContainerInlineStyles: true,
        containerClass: 'tagcloud-container',
        itemClass: 'tagcloud-item'
    };

    TagCloud(selector, texts, options);

    // Custom color for this cloud if needed, though CSS handles hover
    // We can inject styles dynamically or just rely on CSS variables
};

const initSkillsCloud = () => {
    // Technical Skills
    initCloud('.skills-cloud-tech', [
        'Python', 'Java', 'MySQL',
        'Excel', 'Power BI', 'Flask',
        'HTML', 'CSS', 'OpenCV',
        'NumPy', 'Pandas', 'DAX'
    ], '#2dd4bf');

    // Areas of Interest
    initCloud('.skills-cloud-interest', [
        'Data Viz', 'Database Mgmt',
        'NLP', 'Machine Learning',
        'Cloud Computing', 'AI',
        'Deep Learning', 'Statistics'
    ], '#f59e0b'); // Amber for variety? Or keep teal.

    // Soft Skills
    initCloud('.skills-cloud-soft', [
        'Team Lead', 'Collaboration',
        'Communication', 'Efficiency',
        'Resilience', 'Problem Solving',
        'Creativity', 'Leadership'
    ], '#2dd4bf');
};

// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSkillsCloud, 100);
});

export default initSkillsCloud;
