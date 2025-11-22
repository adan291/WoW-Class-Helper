import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoTutorials } from './VideoTutorials.tsx';
import { WowClass } from '../types.ts';

const mockClass: WowClass = {
    id: 'warrior',
    name: 'Warrior',
    color: '#C79C6E',
    specs: [
        { id: 'arms', name: 'Arms', role: 'Damage' },
        { id: 'fury', name: 'Fury', role: 'Damage' },
        { id: 'protection', name: 'Protection', role: 'Tank' }
    ],
    role: 'tank',
    icon: 'warrior-icon',
    description: 'A strong melee fighter.',
    videoTutorials: [
        {
            title: 'Test Video 1',
            url: 'https://example.com/1',
            thumbnail: 'https://example.com/thumb1.jpg'
        }
    ]
};

describe('VideoTutorials Component', () => {
    it('should render video tutorials from props', () => {
        render(<VideoTutorials wowClass={mockClass} />);

        expect(screen.getByText('Video Tutorials')).toBeInTheDocument();
        expect(screen.getByText('Test Video 1')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Test Video 1/i })).toHaveAttribute('href', 'https://example.com/1');
    });

    it('should render default videos if no tutorials provided', () => {
        const classWithoutVideos = { ...mockClass, videoTutorials: undefined };
        render(<VideoTutorials wowClass={classWithoutVideos} />);

        expect(screen.getByText('Video Tutorials')).toBeInTheDocument();
        expect(screen.getByText(/Warrior Overview & Basics/i)).toBeInTheDocument();
    });
});
