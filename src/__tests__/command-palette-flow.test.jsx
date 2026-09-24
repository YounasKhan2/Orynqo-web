import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../components/command-palette/CommandPalette';

describe('CommandPalette - Work Item Selection Flow', () => {
  const mockItems = [
    {
      id: 'item-101',
      identifier: 'OR-101',
      title: 'Design scalable tokens',
      priority: 'high',
      status: 'in_progress'
    },
    {
      id: 'item-102',
      identifier: 'OR-102',
      title: 'Fix keyboard focus trap',
      priority: 'urgent',
      status: 'todo'
    }
  ];

  it('selects exact work item, closes palette, and does NOT mutate the item', () => {
    const handleSelectItem = vi.fn();
    const handleClose = vi.fn();
    const originalItem = { ...mockItems[0] };

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        items={mockItems}
        onSelectItem={handleSelectItem}
      />
    );

    // Search for item
    const searchInput = screen.getByPlaceholderText(/Type a command, item ID, or title/i);
    fireEvent.change(searchInput, { target: { value: 'scalable' } });

    // Item should be displayed
    const itemButton = screen.getByText('Design scalable tokens');
    expect(itemButton).toBeTruthy();

    // Click on item
    fireEvent.click(itemButton);

    // Verified: onSelectItem was called with the exact item
    expect(handleSelectItem).toHaveBeenCalledTimes(1);
    expect(handleSelectItem).toHaveBeenCalledWith(mockItems[0]);

    // Verified: onClose was triggered to close palette
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Verified: Item was not mutated in-place
    expect(mockItems[0]).toEqual(originalItem);
  });

  it('allows keyboard navigation with ArrowDown and Enter to select', () => {
    const handleSelectItem = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        items={mockItems}
        onSelectItem={handleSelectItem}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Type a command, item ID, or title/i);
    fireEvent.change(searchInput, { target: { value: 'keyboard' } });

    // Press ArrowDown to select first result, then Enter
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(handleSelectItem).toHaveBeenCalledWith(mockItems[1]);
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        items={mockItems}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
