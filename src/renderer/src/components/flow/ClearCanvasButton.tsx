import { Button } from '../ui/Button';

import { useFlowchartStore } from '@/stores/flowchart';
import { useShallow } from 'zustand/react/shallow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/AlertDialog';

const ClearCanvasButton = () => {
  const { reset } = useFlowchartStore(
    useShallow((state) => ({
      reset: state.reset
    }))
  );
  const onClearCanvas = (): void => {
    reset();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Clear Canvas</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear the entire flowchart canvas!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClearCanvas}>Clear</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearCanvasButton;
