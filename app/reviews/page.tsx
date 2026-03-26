"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf, Loader2 } from "lucide-react";
import { reviewsApi } from "@/lib/api-client";

interface Review {
  id: number;
  productId: number;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  product: {
    title: string;
    images: { url: string }[];
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getAll();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (reviewId: number, isApproved: boolean) => {
    try {
      // Optimistic update
      setReviews(reviews.map(review =>
        review.id === reviewId
          ? { ...review, verified: isApproved }
          : review
      ));

      if (isApproved) {
        await reviewsApi.approve(reviewId);
      } else {
        // If unchecking, effectively rejecting/deleting or just un-verifying?
        // Backend 'reject' deletes it. 'approve' sets verified=true.
        // Schema has verified boolean. Logic:
        // If we toggle ON -> approve (verified=true)
        // If we toggle OFF -> reject (delete? or just set verified=false?)
        // User prompt said: "verified property is by default set to false... admin needs to approve review"
        // Backend has approve and reject. Reject deletes.
        // If the toggle is just for "verified" status, we might need a separate endpoint to un-verify if that's the intent.
        // However, usually "Approve" means make visible.
        // Let's assume toggle ON calls approve.
        // What if I toggle OFF? The current UI implies a simple switch.
        // If I assume toggle OFF = Reject (Delete), that's destructive.
        // Let's implement toggle OFF as "Un-approve" (set verified false) if backend supported it, but backend 'reject' deletes.
        // FOR NOW: I will treat specific "Reject" action separately if UI allowed, but with a Switch, it usually implies State Change.
        // Let's check backend controller.
        // Backend `reject` deletes.
        // I should probably ONLY allow turning ON approval. If they want to remove, maybe a delete button?
        // The existing UI uses a Switch.
        // I will assume for now: Switch ON -> Approve. Switch OFF -> Do nothing or Warning?
        // Actually, if I look at my backend service, `approve` sets verified=true.
        // I don't have an `unapprove` method.
        // I'll stick to: Switch ON -> approve.
        // If they switch OFF, I might need to warn "This operation is not fully supported via toggle yet" or implement `unverify`.
        // Let's implement `unverify` in backend if needed? Or simply allow the switch to behave as "Verified" status.
        // Wait, I can only approve.
        // Let's look at `handleApprovalChange`.
        // If `checked` is true, call approve.
        // If `checked` is false, for now I will revert the optimistic update and show alert?
        // User said: "admin needs to approve review".
        // I will implement: Toggle ON calls approve.
        // I won't implement Toggle OFF logic yet as 'reject' is delete.
        // Ideally, I should add a "Delete" button for rejection.
        // But the UI has a Switch.
        // I'll assume Switch represents `verified` state.
        // If I want to un-verify, I need backend support.
        // I'll update backend to have `unverify`? Or just ignore for now?
        // Let's just make it call approve when confirmed.

        if (!isApproved) {
          // Revert optimistic update for now since we don't have unverify
          setReviews(reviews.map(review =>
            review.id === reviewId
              ? { ...review, verified: !isApproved } // revert
              : review
          ));
          alert("To reject a review, please request a delete feature or we can add a delete button.");
          return;
        }
      }
    } catch (error) {
      console.error("Error updating review:", error);
      // Revert on error
      setReviews(reviews.map(review =>
        review.id === reviewId
          ? { ...review, verified: !isApproved }
          : review
      ));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Reviews</h1>
      </div>

      {/* Reviews Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100">
                      {review.product.images && review.product.images[0] && (
                        <Image
                          src={`${API_URL}${review.product.images[0].url}`}
                          alt={review.product.title}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{review.product.title}</span>
                      <span className="text-sm text-gray-500">ID: {review.productId}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StarRating rating={review.rating} />
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px]">
                    <p className="text-sm truncate">{review.comment}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{review.user.username}</span>
                    <span className="text-sm text-gray-500">{review.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={review.verified ? "default" : "secondary"} className={review.verified ? "bg-green-500 hover:bg-green-600" : "bg-slate-500 hover:bg-slate-600"}>
                    {review.verified ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Switch
                      checked={review.verified}
                      onCheckedChange={(checked) => handleApprovalChange(review.id, checked)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
