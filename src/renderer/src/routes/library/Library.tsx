import BlocksLibrary from '@/components/flow/BlocksLibrary';
import Header from '@/components/root/Header';
import { ScrollArea } from '@/components/ui/ScrollArea';

const Library = () => {
  return (
    <div>
      <Header title="Blocks Library" />
      <ScrollArea className="h-screen">
        <BlocksLibrary />
      </ScrollArea>
    </div>
  );
};

export default Library;
