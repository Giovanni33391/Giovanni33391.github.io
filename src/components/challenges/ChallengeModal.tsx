import React from 'react';
import { Modal } from '../ui/Modal';
import { ChallengeCard } from './ChallengeCard';
import { Challenge } from '@/types';

interface ChallengeModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string, manualMetric?: number) => void;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
  isToday: (date: string | null) => boolean;
}

export const ChallengeModal = ({ challenge, isOpen, onClose, onComplete, onDelete, onRefresh, isToday }: ChallengeModalProps) => {
  if (!challenge) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={challenge.name}>
      <div className="py-4">
        <ChallengeCard
          challenge={challenge}
          onComplete={(id, metric) => {
            onComplete(id, metric);
            onClose();
          }}
          onDelete={(id) => {
            onDelete(id);
            onClose();
          }}
          onRefresh={onRefresh}
          isToday={isToday}
        />
      </div>
    </Modal>
  );
};
