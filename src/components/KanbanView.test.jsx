/** @vitest-environment jsdom */
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import React from 'react';
import KanbanView from './KanbanView';


/**
 * Test that the Trash (delete) button on each applicant card calls the
 * `onDeleteApplicant` handler with the correct applicant id.
 */
test('clicking delete button calls onDeleteApplicant with applicant id', async () => {
  const mockDelete = vi.fn();
  const mockMoveStage = vi.fn();
  const mockUpdate = vi.fn();
  const mockSchedule = vi.fn();
  const mockSetSelected = vi.fn();

  const dummyProject = { id: 'proj1', title: 'Test Project', status: 'open' };
  const dummyApplicant = {
    id: 'applicant-123',
    name: 'John Doe',
    project_id: dummyProject.id,
    stage: 'new',
    created_at: new Date().toISOString(),
    phone: '',
    email: '',
    resume_url: ''
  };

  render(
    <KanbanView
      projects={[dummyProject]}
      applicants={[dummyApplicant]}
      interviews={[]}
      onMoveStage={mockMoveStage}
      onUpdateApplicant={mockUpdate}
      onScheduleInterview={mockSchedule}
      onDeleteApplicant={mockDelete}
      selectedApplicant={null}
      setSelectedApplicant={mockSetSelected}
    />
  );

  // Locate the delete button (Trash icon) within the applicant card.
  const deleteButton = await screen.findByRole('button');
  await userEvent.click(deleteButton);

  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('applicant-123');
});
