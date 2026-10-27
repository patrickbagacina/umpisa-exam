import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemForm } from './ItemForm';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Blue umbrella');
  await user.selectOptions(screen.getByLabelText('Category'), 'OTHER');
  await user.type(screen.getByLabelText('Location found'), 'Lobby');
}

describe('ItemForm', () => {
  it('shows field errors and does not submit an invalid form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Name'), 'U');
    await user.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Choose a category')).toBeInTheDocument();
    expect(screen.getByText('Location is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a foundAt in the future', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText('Date found'));
    await user.type(screen.getByLabelText('Date found'), '2999-01-01T10:00');
    await user.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByText('Date found cannot be in the future')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed input with foundAt defaulting to now', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Save item' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Blue umbrella',
      description: null,
      category: 'OTHER',
      locationFound: 'Lobby',
      foundAt: expect.any(String),
    });
    const { foundAt } = onSubmit.mock.calls[0][0];
    expect(Date.now() - new Date(foundAt).getTime()).toBeLessThan(2 * 60 * 1000);
  });

  it('shows a server error and disables the button while saving', () => {
    render(<ItemForm onSubmit={vi.fn()} submitting serverError="Name too short" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Name too short');
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
