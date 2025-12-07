import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { AgentRole } from './types';
import * as geminiService from './services/geminiService';

// Mock the geminiService
vi.mock('./services/geminiService', async (importOriginal) => {
  const actual = await importOriginal<typeof geminiService>();
  return {
    ...actual,
    runAgentSimulation: vi.fn().mockImplementation((role) => {
      return Promise.resolve({
        text: `Mocked response for ${role}`,
        code: `print("Mocked code for ${role}")`,
        status: 'APPROVED'
      });
    }),
  };
});

describe('App Simulation Workflow', () => {
  it('should run the Accessibility agent during simulation when installed', async () => {
    render(<App />);

    // Wait for boot sequence (2 seconds)
    await waitFor(() => {
        expect(screen.queryByText('Initializing Multi-Agent Kernel...')).not.toBeInTheDocument();
    }, { timeout: 4000 });

    // Switch to Agents tab to see the "Initialize Swarm" button
    const agentLabButton = screen.getByText('Agent Lab').closest('button');
    if (!agentLabButton) throw new Error("Agent Lab button not found");
    fireEvent.click(agentLabButton);

    // Now we should see "Initialize Swarm" button
    const initButton = await screen.findByText('Initialize Swarm');
    fireEvent.click(initButton);

    // Verify that runAgentSimulation was called for Accessibility
    // We expect it to be called for Analyst, Architect, Coder, Critic, and potentially Security/Perf if installed.
    // a11y_01 is installed by default.

    await waitFor(() => {
      expect(geminiService.runAgentSimulation).toHaveBeenCalledWith(AgentRole.ANALYST, expect.anything());
      expect(geminiService.runAgentSimulation).toHaveBeenCalledWith(AgentRole.ARCHITECT, expect.anything());
      expect(geminiService.runAgentSimulation).toHaveBeenCalledWith(AgentRole.CODER, expect.anything());
      expect(geminiService.runAgentSimulation).toHaveBeenCalledWith(AgentRole.CRITIC, expect.anything());
      // Expect Accessibility to be called
      expect(geminiService.runAgentSimulation).toHaveBeenCalledWith(AgentRole.ACCESSIBILITY, expect.anything());
    }, { timeout: 15000 });

  }, 20000); // Increased test timeout
});
