import { Student, VoteRecord } from '../types';

export function getVoterWeight(voter: Pick<Student, 'voter_type' | 'voter_weight'>): number {
  return voter.voter_weight ?? (voter.voter_type === 'GURU' ? 3 : 1);
}

export function getVoteWeight(vote: Pick<VoteRecord, 'vote_weight'>): number {
  return vote.vote_weight ?? 1;
}
