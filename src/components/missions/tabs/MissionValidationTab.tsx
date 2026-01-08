import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MissionOrder, MissionValidation } from "@/types/mission";
import { useValidateMission } from "@/hooks/useMissions";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MessageSquare,
  ArrowRight
} from "lucide-react";

interface MissionValidationTabProps {
  mission: MissionOrder;
  validations: MissionValidation[];
}

const levelLabels: Record<string, string> = {
  'N1_Superieur': 'Supérieur Hiérarchique (N+1)',
  'N2_DAF': 'Direction Administrative et Financière',
  'N3_DG': 'Direction Générale',
};

const levelOrder = ['N1_Superieur', 'N2_DAF', 'N3_DG'];

const getNextStatus = (currentLevel: string, approved: boolean): string => {
  if (!approved) return 'Rejetée';
  
  const currentIndex = levelOrder.indexOf(currentLevel);
  if (currentIndex === levelOrder.length - 1) return 'Approuvée';
  
  const nextLevel = levelOrder[currentIndex + 1];
  return `En validation ${nextLevel.replace('_', ' ').replace('N2', 'DAF').replace('N3', 'DG').replace('N1', 'N1')}`;
};

export function MissionValidationTab({ mission, validations }: MissionValidationTabProps) {
  const { user } = useAuth();
  const role = useUserRole();
  const isAdmin = role.data === 'admin';
  const validateMutation = useValidateMission();
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleValidate = async (validation: MissionValidation, approve: boolean) => {
    const nextStatus = approve 
      ? (validation.validation_level === 'N3_DG' ? 'Approuvée' : 
         validation.validation_level === 'N2_DAF' ? 'En validation DG' : 'En validation DAF')
      : 'Rejetée';
    
    await validateMutation.mutateAsync({
      validationId: validation.id,
      status: approve ? 'Approuvé' : 'Rejeté',
      comments: comments[validation.id],
      missionId: mission.id,
      nextStatus
    });
  };

  const canValidate = (validation: MissionValidation): boolean => {
    if (validation.status !== 'En attente') return false;
    if (isAdmin) return true;
    
    // Check if current level matches mission status
    const expectedStatus = `En validation ${validation.validation_level.replace('_', ' ').replace('N1', 'N1').replace('N2', 'DAF').replace('N3', 'DG')}`;
    return mission.extended_status === expectedStatus || 
           (validation.validation_level === 'N1_Superieur' && mission.extended_status === 'En validation N1') ||
           (validation.validation_level === 'N2_DAF' && mission.extended_status === 'En validation DAF') ||
           (validation.validation_level === 'N3_DG' && mission.extended_status === 'En validation DG');
  };

  // Historique complet de la validation
  const workflowSteps: Array<{ status: string; label: string; done: boolean; approved?: boolean; rejected?: boolean }> = [
    { status: 'Brouillon', label: 'Création', done: true },
    { status: 'Soumise', label: 'Soumise', done: ['Soumise', 'En validation N1', 'En validation DAF', 'En validation DG', 'Approuvée', 'Rejetée'].includes(mission.extended_status || '') },
    ...validations.map(v => ({
      status: v.validation_level,
      label: levelLabels[v.validation_level],
      done: v.status !== 'En attente',
      approved: v.status === 'Approuvé',
      rejected: v.status === 'Rejeté',
    })),
    { 
      status: 'Approuvée', 
      label: 'Approuvée', 
      done: mission.extended_status === 'Approuvée' || ['Planifiée', 'En cours', 'Terminée', 'En attente rapport', 'Rapport soumis', 'En liquidation', 'Liquidée', 'Soldée'].includes(mission.extended_status || '') 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Timeline du workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Circuit de Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.rejected ? 'bg-red-500 text-white' :
                    step.approved || step.done ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step.rejected ? (
                      <XCircle className="h-5 w-5" />
                    ) : step.approved || step.done ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs text-center mt-2 max-w-[80px]">{step.label}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Détail des validations */}
      <div className="space-y-4">
        {validations.map((validation, index) => (
          <Card key={validation.id} className={
            validation.status === 'Approuvé' ? 'border-green-500/50' :
            validation.status === 'Rejeté' ? 'border-red-500/50' :
            'border-yellow-500/50'
          }>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {levelLabels[validation.validation_level]}
                </CardTitle>
                <Badge className={
                  validation.status === 'Approuvé' ? 'bg-green-500' :
                  validation.status === 'Rejeté' ? 'bg-red-500' :
                  'bg-yellow-500'
                }>
                  {validation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {validation.status !== 'En attente' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{validation.validator_name || 'Validateur'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {validation.validated_at && format(new Date(validation.validated_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </div>
                  </div>
                  {validation.comments && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{validation.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : canValidate(validation) ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Commentaires (optionnel)..."
                    value={comments[validation.id] || ''}
                    onChange={(e) => setComments({ ...comments, [validation.id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleValidate(validation, true)}
                      disabled={validateMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleValidate(validation, false)}
                      disabled={validateMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  En attente de validation par le niveau précédent
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si mission rejetée */}
      {mission.extended_status === 'Rejetée' && (
        <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Mission Rejetée</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cette mission a été rejetée. Vous pouvez la modifier et la soumettre à nouveau.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
