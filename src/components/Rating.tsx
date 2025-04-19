'use client';

import { useEffect, useReducer } from "react";
import Card from "./Card";
import getReviewsDentist from "@/libs/getReviewsDentist";

type RatingData = {
  rating: number;
  review: string;
};

type Action =
  | { type: 'change'; dentistName: string; data: RatingData }
  | { type: 'remove'; dentistName: string }
  | { type: 'init'; data: Map<string, RatingData> };

export default function DentistRating({ dentistId }: { dentistId: string }) {
  const ratingReducer = (ratingList: Map<string, RatingData>, action: Action) => {
    const newList = new Map(ratingList);
    switch (action.type) {
      case 'change':
        newList.set(action.dentistName, action.data);
        return newList;
      case 'remove':
        newList.delete(action.dentistName);
        return newList;
      case 'init':
        return action.data;
      default:
        return newList;
    }
  };

  const [ratingList, dispatchChange] = useReducer(
    ratingReducer,
    new Map<string, RatingData>()
  );

  useEffect(() => {
    async function fetchRatings() {
      const response = await getReviewsDentist(dentistId); // Use dentistId to fetch reviews
      const dataMap = new Map<string, RatingData>();

      if (response.success && Array.isArray(response.data)) {
        for (const review of response.data) {
          dataMap.set(review.user.name, {
            rating: review.rating,
            review: review.review,
          });
        }
      }

      dispatchChange({ type: 'init', data: dataMap });
    }

    fetchRatings();
  }, [dentistId]);

  return (
    <div className="w-full min-h-screen px-10">
      <h1 className="text-3xl font-bold text-black py-10 px-10">Review</h1>
      <h2 className="text-xl font-semibold text-black px-14">John Wick</h2>

      <div className="px-14 space-y-6 py-6">
        <Card
          dentistName="Dr. John Carter"
          onRate={(dentistName, rating, review) =>
            dispatchChange({ type: 'change', dentistName, data: { rating, review } })}
        />

        <div className="pt-10">
          <h3 className="font-medium text-gray-700">⭐️ Ratings Collected:</h3>
          {Array.from(ratingList.entries()).map(([name, data]) => (
            <div key={name} className="text-sm text-gray-600">
              <p>{name}: {data.rating} stars</p>
              <p className="italic text-gray-900">"{data.review}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
