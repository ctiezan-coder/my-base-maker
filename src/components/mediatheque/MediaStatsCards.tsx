import { Card, CardContent } from '@/components/ui/card';
import { Image, Video, Music, FileText, HardDrive, Eye, Download, FolderOpen } from 'lucide-react';
import { useMediaStats, useMediaAlbums } from '@/hooks/useMediaLibrary';

export function MediaStatsCards() {
  const { data: stats } = useMediaStats();
  const { data: albums } = useMediaAlbums();

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  const cards = [
    {
      title: 'Total fichiers',
      value: stats?.totalFiles || 0,
      icon: Image,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Albums',
      value: albums?.length || 0,
      icon: FolderOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Stockage utilisé',
      value: formatSize(stats?.totalSize || 0),
      icon: HardDrive,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Vues totales',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Téléchargements',
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
