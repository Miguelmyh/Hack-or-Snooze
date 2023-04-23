"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="favorites">
          <i class="fa fa-star ${isAFavorite(story)}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function isAFavorite(story) {
  if (!currentUser) return "unfav";
  else return currentUser.isFavorite(story);
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $("#add-stories").hide();
  $loginForm.hide();
  $signupForm.hide();
  $allFavoritesList.hide();
  $userStories.hide();
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function newStorySubmit(evt) {
  evt.preventDefault();
  let title = $("#title-input").val();
  let url = $("#url-input").val();
  let author = $("#author-input").val();
  let username = currentUser.username;

  const storyData = { title, author, url, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
  putStoriesOnPage();
  $submitForm.hide();
}

$submitForm.on("submit", newStorySubmit);

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allFavoritesList.empty();

  if (currentUser.favorites.length === 0) {
    $allFavoritesList.append("<h5>You don't have any favorites yet.</h5>");
  } else {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $allFavoritesList.append($story);
    }
  }

  $allFavoritesList.show();
}

async function newFavorite(evt) {
  console.debug("newFavorite");
  const $tgt = $(evt.target);
  const storyId = $(evt.target).closest("li").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($tgt.hasClass("fav")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fav unfav");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fav unfav");
  }
}

$allStoriesList.on("click", ".fa-star", newFavorite);

async function deleteStory(evt) {
  console.debug("deleteStory");
  const $tgt = $(evt.target);
  const storyId = $(evt.target).closest("li").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  await storyList.removeStory(currentUser, storyId);
  await putStoriesOnPage();
}

$userStories.on("click", ".trash", deleteStory);

async function putMyStoriesOnPage(evt) {
  console.debug("putMyStoriesOnPage");

  $userStories.empty();

  if (currentUser.ownStories.length === 0) {
    $userStories.append("<h5>You don't have any stories yet.</h5>");
  } else {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      let $deleteBtn = makeTrashCan();
      $story.prepend($deleteBtn);
      $userStories.append($story);
    }
  }

  $userStories.show();
}

function makeTrashCan() {
  return $(`
    <span class="trash" >
      <i class="fa fa-trash trash-can" ></i>
    </span>
  `);
}
